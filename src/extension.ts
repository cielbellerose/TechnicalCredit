import * as vscode from "vscode";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// tree-sitter outputs 
const detectedSignals = {
  H1: "3 pure interfaces found out of 12 total interfaces",
  H2: "2 classes implement interfaces from different packages, 5 implement from same package",
  H3: "4 constructors use injection, 8 do not, 2 use @Autowired",
  H4: "found: UserService, OrderRepository, PaymentGateway, DataMapper, BaseClass, Helper, Manager",
  H5: "1 Micrometer import found, no MDC usage detected",
};

const HEURISTICS = ['H1', 'H2', 'H3', 'H4', 'H5'];
const SAMPLES = 5; 

// run the prompt n times & return all score sets
async function samplePrompt(prompt: string): Promise<Record<string, number>[]> {
  const results: Record<string, number>[] = [];

  for (let i = 0; i < SAMPLES; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `${prompt}\n\nDetected signals:\n${JSON.stringify(detectedSignals, null, 2)}\n\nYou must respond with ONLY a JSON object, no other text, no explanation. Example: {"H1": 5, "H2": 3, "H3": 7, "H4": 4, "H5": 6}`
      }]
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

	const cleaned = text.replace(/```json|```/g, '').trim();
	results.push(JSON.parse(cleaned));
	console.log(`Sample ${results.length}:`, JSON.parse(cleaned));

    try {
      results.push(JSON.parse(cleaned));
    } catch {
      console.warn('Failed to parse response, skipping sample');
    }
  }

  return results;
}

// compute mean variance across all heuristics, the lower the better
function computeVariance(samples: Record<string, number>[]): number {
  return HEURISTICS.reduce((total, h) => {
    const values = samples.map(s => s[h]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return total + variance;
  }, 0) / HEURISTICS.length;
}

// ask Claude to propose a better prompt given history
async function proposeNewPrompt(history: { prompt: string; variance: number }[]): Promise<string> {
  const historyText = history
    .map((h, i) => `Attempt ${i + 1}:\nPrompt: ${h.prompt}\nVariance: ${h.variance.toFixed(4)}`)
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `You are optimizing a prompt for scoring Java technical credit across 5 heuristics (H1-H5) on a scale of 0-10.

The goal is to minimize variance across repeated runs — a good prompt produces consistent scores.

Here are previous attempts and their variance scores (lower is better):

${historyText}

Propose a better prompt. Return only the prompt text, nothing else.`
    }]
  });

  return response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');
}

// OPRO loop
async function opro(initialPrompt: string, iterations: number) {
  const history: { prompt: string; variance: number }[] = [];
  let currentPrompt = initialPrompt;

  for (let i = 0; i < iterations; i++) {
    console.log(`**Iteration ${i + 1}**`);
    console.log('Prompt:', currentPrompt);

    const samples = await samplePrompt(currentPrompt);
    const variance = computeVariance(samples);
    console.log('Variance:', variance.toFixed(4));

    history.push({ prompt: currentPrompt, variance });

    if (i < iterations - 1) {
      currentPrompt = await proposeNewPrompt(history);
    }
  }

  const best = history.reduce((a, b) => a.variance < b.variance ? a : b);
  console.log('\n--- Best Prompt ---');
  console.log(best.prompt);
  console.log('Variance:', best.variance.toFixed(4));
  return best;
}


const initialPrompt = `Score each of the five heuristics (H1-H5) on a scale from 0 to 10, where 0 represents the worst 
possible technical credit and 10 represents the best possible technical credit. Evaluate based on long-term maintainability, code quality, and sustainable development practices.`;

opro(initialPrompt, 5);