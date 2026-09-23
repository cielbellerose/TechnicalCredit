import * as fs from 'fs';
import * as path from 'path';

import { buildContextFromSource } from '../../context/buildContext';
import { setExtensionPath } from '../../context/javaParser';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt';
import { createUserPrompt } from '../../prompts/userPrompts';
import { callClaude } from '../../utils/claude';
import { createCategoryPrompt } from '../../prompts/categories';
import type { Category } from '../../prompts/categories';
import { TCResult } from '../../comment/tcResult';

setExtensionPath(path.join(__dirname, '../../../'));

const mockSourceCache = new Map<string, string>();

function readMockSource(sourceFile: string): string {
  let source = mockSourceCache.get(sourceFile);
  if (source === undefined) {
    source = fs.readFileSync(sourceFile, 'utf-8');
    mockSourceCache.set(sourceFile, source);
  }
  return source;
}

/**
 * Sends the construct named `name` to Claude using the full production
 * context path (buildContextFromSource → createUserPrompt) and the
 * category-specific system prompt, then returns the parsed TCResult.
 *
 * @param name - Type name exactly as declared in the mock source file, e.g. "Shape".
 * @param category - The category whose prompt should be appended to the system prompt.
 * @param sourceFile - Absolute path to the mock Java file, usually the one next to
 *   the test, e.g. `path.join(__dirname, 'Positive.java')`.
 * @throws If the construct cannot be found or context cannot be built.
 */
export async function analyseConstruct(
  name: string,
  category: Category,
  sourceFile: string,
): Promise<TCResult> {
  const mockSource = readMockSource(sourceFile);
  const mockLines = mockSource.split('\n');
  const fileName = path.basename(sourceFile);

  const anchorLine = mockLines.findIndex((line) =>
    new RegExp(`\\b(class|interface)\\s+${name}\\b`).test(line),
  );

  if (anchorLine === -1) {
    throw new Error(`${fileName} has no construct named "${name}".`);
  }

  const context = await buildContextFromSource(
    mockSource,
    anchorLine,
    0,
    'java',
    fileName,
  );

  if (!context) {
    throw new Error(`buildContextFromSource returned null for "${name}".`);
  }

  const userMessage = createUserPrompt(context);
  const systemMessage = `${SYSTEM_PROMPT}\n\n${createCategoryPrompt(category)}`;

  return callClaude<TCResult>(systemMessage, userMessage);
}
