import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const HEURISTICS = [
  'abstraction',
  'modularity',
  'api-stability',
  'automation',
  'knowledge-preservation',
  'configurability',
  'observability',
  'reusability',
  'compliance-readiness',
] as const;

type Heuristic = (typeof HEURISTICS)[number];

// Fitness = variance + ACCURACY_WEIGHT * (1 - accuracy) * 10
// Multiplying (1 - accuracy) by 10 brings it to the same scale as typical variance values.
// ACCURACY_WEIGHT < 1 keeps variance as the dominant signal.
const ACCURACY_WEIGHT = 0.7;
const SAMPLES = 5;
const SCORE_THRESHOLD = 5; // > threshold = TC detected, <= threshold = not detected

// Representative tree-sitter signals used for the main sampling loop
const detectedSignals: Record<Heuristic, string> = {
  abstraction:
    '3 pure interfaces with no fields, 2 with separate implementations in different packages',
  modularity:
    '2 classes implement interfaces from different packages, 5 from same package',
  'api-stability':
    '3 public methods marked @Deprecated, 1 versioned endpoint, 2 potential breaking changes',
  automation:
    '4 constructors use injection, CI config present, 2 manual deployment scripts',
  'knowledge-preservation':
    '2 ADR documents found, 8 classes with no javadoc, 3 with inline comments',
  configurability:
    '6 hardcoded values found, 3 externalized via @Value, 1 config class',
  observability: '1 Micrometer import found, no MDC usage detected',
  reusability:
    '4 utility classes imported from shared modules, 2 duplicate helper implementations',
  'compliance-readiness':
    '2 audit log implementations, no data retention policy, 1 GDPR annotation',
};

// --- Test case infrastructure ---

interface TestCase {
  name: string;
  code: string;
  heuristic: Heuristic;
  is_tc_candidate: boolean;
  rationale: string;
}

function extractType(source: string, name: string): string {
  const header = new RegExp(`\\b(?:class|interface|enum|record)\\s+${name}\\b`);
  const match = header.exec(source);
  if (!match) {
    return '';
  }
  const braceStart = source.indexOf('{', match.index);
  if (braceStart === -1) {
    return '';
  }
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') {
      depth++;
    } else if (source[i] === '}' && --depth === 0) {
      return source.slice(match.index, i + 1);
    }
  }
  return '';
}

function loadTestCases(): TestCase[] {
  const mockPath = path.join(__dirname, '../src/test/mockCode/MockTest.java');
  const mock = fs.readFileSync(mockPath, 'utf8');

  return [
    // abstraction (H1)
    {
      name: 'EventListener',
      code: extractType(mock, 'EventListener'),
      heuristic: 'abstraction',
      is_tc_candidate: true,
      rationale: 'Single-method interface, no fields — classic abstraction.',
    },
    {
      name: 'Validator',
      code: extractType(mock, 'Validator'),
      heuristic: 'abstraction',
      is_tc_candidate: true,
      rationale: 'Interface with one method and no fields.',
    },
    {
      name: 'Greetable',
      code: extractType(mock, 'Greetable'),
      heuristic: 'abstraction',
      is_tc_candidate: true,
      rationale: 'Interface with one void method and no fields.',
    },
    {
      name: 'Calculator',
      code: extractType(mock, 'Calculator'),
      heuristic: 'abstraction',
      is_tc_candidate: false,
      rationale: 'Concrete class — not an interface.',
    },
    {
      name: 'Constants',
      code: extractType(mock, 'Constants'),
      heuristic: 'abstraction',
      is_tc_candidate: false,
      rationale: 'Interface with fields — abstraction requires no fields.',
    },
    // observability (H5)
    {
      name: 'OrderMetrics',
      code: extractType(mock, 'OrderMetrics'),
      heuristic: 'observability',
      is_tc_candidate: true,
      rationale: 'Micrometer MeterRegistry field + counter usage.',
    },
    {
      name: 'PaymentProcessor',
      code: extractType(mock, 'PaymentProcessor'),
      heuristic: 'observability',
      is_tc_candidate: true,
      rationale: '@Timed annotation instruments method latency.',
    },
    {
      name: 'AuditLogger',
      code: extractType(mock, 'AuditLogger'),
      heuristic: 'observability',
      is_tc_candidate: true,
      rationale: 'MDC + structured key=value log line.',
    },
    {
      name: 'NaivePrinter',
      code: extractType(mock, 'NaivePrinter'),
      heuristic: 'observability',
      is_tc_candidate: false,
      rationale: 'println string concatenation — no observability infra.',
    },
    {
      name: 'UnstructuredLogger',
      code: extractType(mock, 'UnstructuredLogger'),
      heuristic: 'observability',
      is_tc_candidate: false,
      rationale: 'SLF4J logger but string concatenation — not structured.',
    },
    {
      name: 'ReflectiveLoader',
      code: extractType(mock, 'ReflectiveLoader'),
      heuristic: 'observability',
      is_tc_candidate: false,
      rationale:
        'Micrometer token only in a string literal — not a real import.',
    },
  ];
}

// --- Sampling and scoring ---

function buildScoringRequest(prompt: string, context: string): string {
  const exampleScores = HEURISTICS.reduce(
    (acc, h) => ({ ...acc, [h]: 5 }),
    {} as Record<Heuristic, number>,
  );
  return `${prompt}\n\nContext:\n${context}\n\nYou must respond with ONLY a JSON object scoring each heuristic 0-10. No other text. Example:\n${JSON.stringify(exampleScores)}`;
}

async function callClaude(
  content: string,
): Promise<Record<Heuristic, number> | null> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    messages: [{ role: 'user', content }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    console.warn('Failed to parse Claude response, skipping.');
    return null;
  }
}

async function samplePrompt(
  prompt: string,
): Promise<Record<Heuristic, number>[]> {
  const signalContext = `Detected signals:\n${JSON.stringify(detectedSignals, null, 2)}`;
  const results: Record<Heuristic, number>[] = [];

  for (let i = 0; i < SAMPLES; i++) {
    const scores = await callClaude(buildScoringRequest(prompt, signalContext));
    if (scores) {
      results.push(scores);
      console.log(`  Sample ${i + 1}:`, scores);
    }
  }

  return results;
}

async function evaluateAccuracy(
  prompt: string,
  testCases: TestCase[],
): Promise<number> {
  let correct = 0;

  for (const tc of testCases) {
    const scores = await callClaude(
      buildScoringRequest(prompt, `Java code:\n${tc.code}`),
    );
    if (!scores) {
      continue;
    }

    const score = scores[tc.heuristic];
    const predicted = score > SCORE_THRESHOLD;
    const hit = predicted === tc.is_tc_candidate;

    console.log(
      `  [${tc.heuristic}] ${tc.name}: score=${score} expected=${tc.is_tc_candidate ? 'TC' : 'not TC'} → ${hit ? '✓' : '✗'}`,
    );

    if (hit) {
      correct++;
    }
  }

  return correct / testCases.length;
}

// --- Fitness and optimization ---

function computeVariance(samples: Record<Heuristic, number>[]): number {
  return (
    HEURISTICS.reduce((total, h) => {
      const values = samples.map((s) => s[h]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      return total + variance;
    }, 0) / HEURISTICS.length
  );
}

function combinedFitness(variance: number, accuracy: number): number {
  return variance + ACCURACY_WEIGHT * (1 - accuracy) * 10;
}

async function proposeNewPrompt(
  history: {
    prompt: string;
    variance: number;
    accuracy: number;
    fitness: number;
  }[],
): Promise<string> {
  const historyText = history
    .map(
      (h, i) =>
        `Attempt ${i + 1}:\nPrompt: ${h.prompt}\nVariance: ${h.variance.toFixed(4)} | Accuracy: ${(h.accuracy * 100).toFixed(1)}% | Fitness: ${h.fitness.toFixed(4)}`,
    )
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are optimizing a prompt for scoring Java technical credit across 9 heuristic categories on a scale of 0-10.

The heuristics are: ${HEURISTICS.join(', ')}.

Fitness (lower is better) = variance + ${ACCURACY_WEIGHT} * (1 - accuracy) * 10
- Variance measures consistency across repeated runs (lower = more consistent).
- Accuracy measures correctness on labeled test cases (higher = more correct).
- Variance is the dominant signal.

Here are previous attempts:

${historyText}

Propose a better prompt. Return only the prompt text, nothing else.`,
      },
    ],
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

async function opro(initialPrompt: string, iterations: number) {
  const testCases = loadTestCases();
  const history: {
    prompt: string;
    variance: number;
    accuracy: number;
    fitness: number;
  }[] = [];
  let currentPrompt = initialPrompt;

  for (let i = 0; i < iterations; i++) {
    console.log(`\n=== Iteration ${i + 1} ===`);
    console.log('Prompt:', currentPrompt);

    console.log('\nSampling prompt for variance...');
    const samples = await samplePrompt(currentPrompt);
    const variance = samples.length > 0 ? computeVariance(samples) : Infinity;

    console.log('\nEvaluating accuracy on test cases...');
    const accuracy = await evaluateAccuracy(currentPrompt, testCases);

    const fitness = combinedFitness(variance, accuracy);
    console.log(
      `\nVariance: ${variance.toFixed(4)} | Accuracy: ${(accuracy * 100).toFixed(1)}% | Fitness: ${fitness.toFixed(4)}`,
    );

    history.push({ prompt: currentPrompt, variance, accuracy, fitness });

    if (i < iterations - 1) {
      currentPrompt = await proposeNewPrompt(history);
    }
  }

  const best = history.reduce((a, b) => (a.fitness < b.fitness ? a : b));
  console.log('\n--- Best Prompt ---');
  console.log(best.prompt);
  console.log(
    `Variance: ${best.variance.toFixed(4)} | Accuracy: ${(best.accuracy * 100).toFixed(1)}% | Fitness: ${best.fitness.toFixed(4)}`,
  );
  return best;
}

const initialPrompt = `Score each of the following Java technical credit heuristics on a scale from 0 to 10, where 0 means the heuristic is completely absent and 10 means it is strongly present. Evaluate based on long-term maintainability, code quality, and sustainable development practices.`;

opro(initialPrompt, 5);
