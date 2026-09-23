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

async function analyseSourceText(
  name: string,
  heuristic: HeuristicCategory,
  source: string,
  fileName: string,
): Promise<TCResult> {
  const lines = source.split('\n');

  const anchorLine = lines.findIndex((line) =>
    new RegExp(`\\b(class|interface)\\s+${name}\\b`).test(line),
  );

  if (anchorLine === -1) {
    throw new Error(`${fileName} has no construct named "${name}".`);
  }

  const context = await buildContextFromSource(
    source,
    anchorLine,
    0,
    'java',
    fileName,
  );

  if (!context) {
    throw new Error(`buildContextFromSource returned null for "${name}".`);
  }

  const userMessage = createUserPrompt(context);
  const systemMessage = `${SYSTEM_PROMPT}\n\n${createHeuristicPrompt(heuristic)}`;

  return callClaude<TCResult>(systemMessage, userMessage);
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
  return analyseSourceText(name, heuristic, mockSource, sourceFile);
}

/**
 * Same as {@link analyseConstruct}, but takes the Java source directly
 * instead of reading it from src/test/mockCode - for tests whose fixtures
 * live inline in the test file rather than in a shared mock file.
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 *
 * @param name - Type name exactly as declared in `source`, e.g. "OrderMetrics".
 * @param heuristic - The heuristic category whose prompt should be appended to the system prompt.
 * @param source - Raw Java source containing the construct.
 * @param fileName - Label used for context/parsing purposes only; no file is read. Defaults to "Mock.java".
 * @throws If the construct cannot be found or context cannot be built.
 */
export async function analyseSource(
  name: string,
  heuristic: HeuristicCategory,
  source: string,
  fileName: string = 'Mock.java',
): Promise<TCResult> {
  return analyseSourceText(name, heuristic, source, fileName);
}
