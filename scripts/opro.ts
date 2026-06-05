import * as fs from 'fs';
import * as path from 'path';

import { callClaude } from '@/utils/claude';
import {
  HEURISTIC_CATEGORIES,
  HeuristicCategory,
  createHeuristicPrompt,
  getHeuristicCriteria,
} from '@/prompts/heuristics/index';
import { SYSTEM_PROMPT } from '@/prompts/systemPrompt';

// Runs per test case — used for both consistency and majority-vote accuracy
const CONSISTENCY_SAMPLES = 3;
// ACCURACY_WEIGHT < 1 keeps variance as the dominant signal
const ACCURACY_WEIGHT = 0.7;
const ITERATIONS = 5;

// Appended when evaluating heuristic criteria (simple binary output)
const BINARY_OUTPUT_FORMAT =
  '\n\nRespond with ONLY a JSON object: {"detected": true} or {"detected": false}. No explanation, no other text.';

// Wraps raw criteria with a category header for per-heuristic evaluation
function wrapCriteria(heuristic: HeuristicCategory, criteria: string): string {
  const label = heuristic.toUpperCase().replace(/-/g, ' ');
  return `You are detecting ${label} Technical Credit.\n\n${criteria}`;
}

// --- Test cases ---

interface TestCase {
  name: string;
  code: string;
  heuristic: HeuristicCategory;
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
    // abstraction
    {
      name: 'EventListener',
      code: extractType(mock, 'EventListener'),
      heuristic: 'abstraction',
      is_tc_candidate: true,
      rationale: 'Single-method interface, no fields.',
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
      rationale: 'Interface with fields.',
    },
    // observability
    {
      name: 'OrderMetrics',
      code: extractType(mock, 'OrderMetrics'),
      heuristic: 'observability',
      is_tc_candidate: true,
      rationale: 'Micrometer MeterRegistry + counter.',
    },
    {
      name: 'PaymentProcessor',
      code: extractType(mock, 'PaymentProcessor'),
      heuristic: 'observability',
      is_tc_candidate: true,
      rationale: '@Timed annotation.',
    },
    {
      name: 'AuditLogger',
      code: extractType(mock, 'AuditLogger'),
      heuristic: 'observability',
      is_tc_candidate: true,
      rationale: 'MDC + structured logging.',
    },
    {
      name: 'NaivePrinter',
      code: extractType(mock, 'NaivePrinter'),
      heuristic: 'observability',
      is_tc_candidate: false,
      rationale: 'println string concat.',
    },
    {
      name: 'UnstructuredLogger',
      code: extractType(mock, 'UnstructuredLogger'),
      heuristic: 'observability',
      is_tc_candidate: false,
      rationale: 'SLF4J but string concat — not structured.',
    },
    {
      name: 'ReflectiveLoader',
      code: extractType(mock, 'ReflectiveLoader'),
      heuristic: 'observability',
      is_tc_candidate: false,
      rationale: 'Micrometer only in a string literal.',
    },
  ];
}

// --- Evaluation ---

interface CaseResult {
  name: string;
  heuristic: HeuristicCategory;
  expected: boolean;
  runs: (boolean | null)[];
  majority: boolean;
  consistent: boolean;
  correct: boolean;
}

function summarise(caseResults: CaseResult[]): {
  variance: number;
  accuracy: number;
} {
  const variance =
    1 - caseResults.filter((r) => r.consistent).length / caseResults.length;
  const accuracy =
    caseResults.filter((r) => r.correct).length / caseResults.length;
  return { variance, accuracy };
}

async function runCases(
  systemPromptFn: (tc: TestCase) => string,
  detectionKey: string,
  testCases: TestCase[],
): Promise<CaseResult[]> {
  const caseResults: CaseResult[] = [];

  for (const tc of testCases) {
    const systemPrompt = systemPromptFn(tc);
    const runs: (boolean | null)[] = [];

    for (let i = 0; i < CONSISTENCY_SAMPLES; i++) {
      try {
        const result = await callClaude<Record<string, boolean>>(
          systemPrompt,
          tc.code,
        );
        runs.push(result[detectionKey] ?? null);
      } catch {
        console.warn(
          `  Failed to parse response for ${tc.name}, skipping run.`,
        );
        runs.push(null);
      }
    }

    const valid = runs.filter((r) => r !== null) as boolean[];
    const trueCount = valid.filter(Boolean).length;
    const majority = trueCount > valid.length / 2;
    const consistent = valid.every((r) => r === majority);
    const correct = majority === tc.is_tc_candidate;

    console.log(
      `  [${tc.heuristic}] ${tc.name}: runs=[${valid.join(',')}] majority=${majority} expected=${tc.is_tc_candidate} → ${consistent ? 'consistent' : 'INCONSISTENT'} ${correct ? '✓' : '✗'}`,
    );

    caseResults.push({
      name: tc.name,
      heuristic: tc.heuristic,
      expected: tc.is_tc_candidate,
      runs,
      majority,
      consistent,
      correct,
    });
  }

  return caseResults;
}

function computeFitness(variance: number, accuracy: number): number {
  return variance + ACCURACY_WEIGHT * (1 - accuracy);
}

// --- Shared history / result types ---

interface HistoryEntry {
  prompt: string;
  variance: number;
  accuracy: number;
  fitness: number;
}

interface OproResult {
  bestPrompt: string;
  variance: number;
  accuracy: number;
  fitness: number;
  history: HistoryEntry[];
}

// --- Per-heuristic OPRO ---
// Optimizes the raw detection criteria for a single heuristic.
// The system prompt is fixed; only the criteria text is optimized.

async function evaluateHeuristicCriteria(
  criteria: string,
  heuristic: HeuristicCategory,
  testCases: TestCase[],
): Promise<{ variance: number; accuracy: number; caseResults: CaseResult[] }> {
  const relevant = testCases.filter((tc) => tc.heuristic === heuristic);
  const systemPromptFn = (_tc: TestCase) =>
    wrapCriteria(heuristic, criteria) + BINARY_OUTPUT_FORMAT;
  const caseResults = await runCases(systemPromptFn, 'detected', relevant);
  return { ...summarise(caseResults), caseResults };
}

async function proposeNewCriteria(
  heuristic: HeuristicCategory,
  history: HistoryEntry[],
): Promise<string> {
  const sorted = [...history].sort((a, b) => a.fitness - b.fitness);
  const best = sorted[0];
  const label = heuristic.toUpperCase().replace(/-/g, ' ');

  const historyText = sorted
    .map(
      (h, i) =>
        `Criteria ${i + 1} [fitness=${h.fitness.toFixed(3)}, variance=${h.variance.toFixed(2)}, accuracy=${(h.accuracy * 100).toFixed(0)}%]:\n${h.prompt}`,
    )
    .join('\n\n---\n\n');

  const result = await callClaude<{ prompt: string }>(
    `You are optimizing detection criteria for ${label} Technical Credit in Java code. Return a JSON object with a single key "prompt" containing the new criteria text.`,
    `The criteria is appended after "You are detecting ${label} Technical Credit." and before output format instructions. The user message is a raw Java code snippet. The model outputs {"detected": true/false}.

Fitness (lower is better) = variance + ${ACCURACY_WEIGHT} * (1 - accuracy)
- Variance: fraction of test cases with inconsistent answers across ${CONSISTENCY_SAMPLES} runs (0 = fully consistent).
- Accuracy: fraction of test cases where the majority answer was correct (1 = perfect).
- Variance is the dominant signal.

Best fitness so far: ${best.fitness.toFixed(3)}

Previous criteria (best → worst):

${historyText}

Write NEW criteria that takes a meaningfully different approach. Do not include output format instructions.`,
  );

  console.log(
    `\n  → Proposed: ${result.prompt.slice(0, 120)}${result.prompt.length > 120 ? '...' : ''}`,
  );
  return result.prompt;
}

async function oproHeuristic(
  heuristic: HeuristicCategory,
  testCases: TestCase[],
): Promise<OproResult> {
  const history: HistoryEntry[] = [];
  let currentCriteria = getHeuristicCriteria(heuristic);

  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`\n=== [${heuristic}] Iteration ${i + 1}/${ITERATIONS} ===`);
    const { variance, accuracy } = await evaluateHeuristicCriteria(
      currentCriteria,
      heuristic,
      testCases,
    );
    const f = computeFitness(variance, accuracy);
    console.log(
      `  Variance=${variance.toFixed(3)} Accuracy=${(accuracy * 100).toFixed(0)}% Fitness=${f.toFixed(3)}`,
    );
    history.push({ prompt: currentCriteria, variance, accuracy, fitness: f });
    if (i < ITERATIONS - 1) {
      currentCriteria = await proposeNewCriteria(heuristic, history);
    }
  }

  const best = history.reduce((a, b) => (a.fitness < b.fitness ? a : b));
  console.log(
    `\n[${heuristic}] Best (fitness=${best.fitness.toFixed(3)}):\n${best.prompt}`,
  );
  return {
    bestPrompt: best.prompt,
    variance: best.variance,
    accuracy: best.accuracy,
    fitness: best.fitness,
    history,
  };
}

// --- System prompt OPRO ---
// Optimizes the shared system prompt while keeping all heuristic criteria fixed.
// Uses the full TCResult schema; evaluates across all heuristics with test cases.

async function evaluateSystemPrompt(
  systemPrompt: string,
  testCases: TestCase[],
): Promise<{ variance: number; accuracy: number; caseResults: CaseResult[] }> {
  // Each test case uses the current system prompt + its heuristic's full criteria (with category header)
  const systemPromptFn = (tc: TestCase) =>
    systemPrompt + '\n\n' + createHeuristicPrompt(tc.heuristic);
  const caseResults = await runCases(
    systemPromptFn,
    'is_tc_candidate',
    testCases,
  );
  return { ...summarise(caseResults), caseResults };
}

async function proposeNewSystemPrompt(
  history: HistoryEntry[],
): Promise<string> {
  const sorted = [...history].sort((a, b) => a.fitness - b.fitness);
  const best = sorted[0];

  const historyText = sorted
    .map(
      (h, i) =>
        `System prompt ${i + 1} [fitness=${h.fitness.toFixed(3)}, variance=${h.variance.toFixed(2)}, accuracy=${(h.accuracy * 100).toFixed(0)}%]:\n${h.prompt}`,
    )
    .join('\n\n---\n\n');

  const result = await callClaude<{ prompt: string }>(
    `You are optimizing a shared system prompt used for detecting Technical Credit (TC) across multiple Java code heuristics. Return a JSON object with a single key "prompt" containing the new system prompt text.`,
    `The system prompt is combined with per-heuristic detection criteria and a Java code snippet. The model outputs a JSON object with "is_tc_candidate": true/false (plus annotation fields). The system prompt defines what TC is, the output schema, and any shared reasoning instructions.

Fitness (lower is better) = variance + ${ACCURACY_WEIGHT} * (1 - accuracy)
- Variance: fraction of test cases with inconsistent answers across ${CONSISTENCY_SAMPLES} runs (0 = fully consistent).
- Accuracy: fraction of test cases where the majority is_tc_candidate matched ground truth (1 = perfect).
- Variance is the dominant signal.

Best fitness so far: ${best.fitness.toFixed(3)}

Previous system prompts (best → worst):

${historyText}

Write a NEW system prompt that takes a meaningfully different approach. The output must always include "is_tc_candidate": true/false in the JSON. Do not include per-heuristic criteria — those are appended separately.`,
  );

  console.log(
    `\n  → Proposed: ${result.prompt.slice(0, 120)}${result.prompt.length > 120 ? '...' : ''}`,
  );
  return result.prompt;
}

async function oproSystemPrompt(testCases: TestCase[]): Promise<OproResult> {
  const history: HistoryEntry[] = [];
  let currentPrompt = SYSTEM_PROMPT;

  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`\n=== [system-prompt] Iteration ${i + 1}/${ITERATIONS} ===`);
    const { variance, accuracy } = await evaluateSystemPrompt(
      currentPrompt,
      testCases,
    );
    const f = computeFitness(variance, accuracy);
    console.log(
      `  Variance=${variance.toFixed(3)} Accuracy=${(accuracy * 100).toFixed(0)}% Fitness=${f.toFixed(3)}`,
    );
    history.push({ prompt: currentPrompt, variance, accuracy, fitness: f });
    if (i < ITERATIONS - 1) {
      currentPrompt = await proposeNewSystemPrompt(history);
    }
  }

  const best = history.reduce((a, b) => (a.fitness < b.fitness ? a : b));
  console.log(
    `\n[system-prompt] Best (fitness=${best.fitness.toFixed(3)}):\n${best.prompt}`,
  );
  return {
    bestPrompt: best.prompt,
    variance: best.variance,
    accuracy: best.accuracy,
    fitness: best.fitness,
    history,
  };
}

// --- Main ---

async function main() {
  const testCases = loadTestCases();

  const heuristicsWithCases = HEURISTIC_CATEGORIES.filter((h) =>
    testCases.some((tc) => tc.heuristic === h),
  );
  const skipped = HEURISTIC_CATEGORIES.filter(
    (h) => !testCases.some((tc) => tc.heuristic === h),
  );

  if (skipped.length > 0) {
    console.log(`Skipping heuristics (no test cases): ${skipped.join(', ')}\n`);
  }

  const results: Record<string, OproResult> = {};

  // Phase 1: optimize each heuristic's detection criteria
  console.log('\n### Phase 1: Per-heuristic criteria optimization ###');
  for (const heuristic of heuristicsWithCases) {
    results[heuristic] = await oproHeuristic(heuristic, testCases);
  }

  // Phase 2: optimize the shared system prompt
  console.log('\n### Phase 2: System prompt optimization ###');
  results['system-prompt'] = await oproSystemPrompt(testCases);

  const outputPath = path.join(__dirname, 'opro-results.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
  );
  console.log(`\nResults saved to ${outputPath}`);
}

main();
