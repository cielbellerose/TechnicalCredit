import { TcContext } from '@/context/buildContext';

export function createUserPrompt(context: TcContext) {
  return [
    `Analyse the following code construct for Technical Credit patterns.`,
    `File: ${context.fileName}`,
    `Language: ${context.language}`,
    context.importLines.length > 0
      ? `Imports:\n${context.importLines.join('\n')}`
      : null,
    `Pre-extracted construct metrics (tree-sitter):\n${JSON.stringify(context.constructMetrics, null, 2)}`,
    `Class source:\n${context.constructMetrics.classSource}`,
  ]
    .filter(Boolean)
    .join('\n');
}
