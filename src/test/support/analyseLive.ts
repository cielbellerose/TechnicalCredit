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

const mockSourceCache = new Map<string, string>();

function readMockSource(sourceFile: string): string {
  let source = mockSourceCache.get(sourceFile);
  if (source === undefined) {
    source = fs.readFileSync(
      path.join(__dirname, '../mockCode', sourceFile),
      'utf-8',
    );
    mockSourceCache.set(sourceFile, source);
  }
  return source;
}

/**
 * Sends the construct named `name` to Claude using the full production
 * context path (buildContextFromSource → createUserPrompt) and the
 * heuristic-specific system prompt, then returns the parsed TCResult.
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 *
 * @param name - Type name exactly as declared in the mock source file, e.g. "OrderMetrics".
 * @param heuristic - The heuristic category whose prompt should be appended to the system prompt.
 * @param sourceFile - File under src/test/mockCode to read from. Defaults to "MockTest.java".
 * @throws If the construct cannot be found or context cannot be built.
 */
export async function analyseConstruct(
  name: string,
  heuristic: HeuristicCategory,
  sourceFile: string = 'MockTest.java',
): Promise<TCResult> {
  const mockSource = readMockSource(sourceFile);
  const mockLines = mockSource.split('\n');

  const anchorLine = mockLines.findIndex((line) =>
    new RegExp(`\\b(class|interface)\\s+${name}\\b`).test(line),
  );

  if (anchorLine === -1) {
    throw new Error(`${sourceFile} has no construct named "${name}".`);
  }

  const context = await buildContextFromSource(
    mockSource,
    anchorLine,
    0,
    'java',
    sourceFile,
  );

  if (!context) {
    throw new Error(`buildContextFromSource returned null for "${name}".`);
  }

  const userMessage = createUserPrompt(context);
  const systemMessage = `${SYSTEM_PROMPT}\n\n${createHeuristicPrompt(heuristic)}`;

  return callClaude<TCResult>(systemMessage, userMessage);
}
