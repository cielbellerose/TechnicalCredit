import * as fs from 'fs';
import * as path from 'path';

import { buildContextFromSource } from '../../context/buildContext';
import { setExtensionPath } from '../../context/javaParser';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt';
import { createUserPrompt } from '../../prompts/userPrompts';
import { callClaude } from '../../utils/claude';
import { createHeuristicPrompt } from '../../prompts/heuristics';
import type { HeuristicCategory } from '../../prompts/heuristics';
import { TCResult } from '../../comment/tcResult';

setExtensionPath(path.join(__dirname, '../../../'));

const MOCK_SOURCE = fs.readFileSync(
  path.join(__dirname, '../mockCode/MockTest.java'),
  'utf-8',
);
const MOCK_LINES = MOCK_SOURCE.split('\n');

/**
 * Sends the MockTest.java construct named `name` to Claude using the full
 * production context path (buildContextFromSource → createUserPrompt) and the
 * heuristic-specific system prompt, then returns the parsed TCResult.
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 *
 * @param name - Type name exactly as declared in MockTest.java, e.g. "OrderMetrics".
 * @param heuristic - The heuristic category whose prompt should be appended to the system prompt.
 * @throws If the construct cannot be found or context cannot be built.
 */
export async function analyseConstruct(
  name: string,
  heuristic: HeuristicCategory,
): Promise<TCResult> {
  const anchorLine = MOCK_LINES.findIndex((line) =>
    new RegExp(`\\b(class|interface)\\s+${name}\\b`).test(line),
  );

  if (anchorLine === -1) {
    throw new Error(`MockTest.java has no construct named "${name}".`);
  }

  const context = await buildContextFromSource(
    MOCK_SOURCE,
    anchorLine,
    0,
    'java',
    'MockTest.java',
  );

  if (!context) {
    throw new Error(`buildContextFromSource returned null for "${name}".`);
  }

  const userMessage = createUserPrompt(context);
  const systemMessage = `${SYSTEM_PROMPT}\n\n${createHeuristicPrompt(heuristic)}`;

  return callClaude<TCResult>(systemMessage, userMessage);
}
