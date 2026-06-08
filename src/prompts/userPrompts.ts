import { TcContext } from '@/context/buildContext';
import type { AdrSummary } from '@/context/findAdrs';

export function createUserPrompt(context: TcContext, adrs: AdrSummary[] = []) {
  const adrSection =
    adrs.length > 0
      ? `ADRs in this repository:\n${adrs.map((a) => [a.id, a.title, a.tcContext].filter(Boolean).join(' — ')).join('\n')}`
      : null;

  return [
    `Analyse the following code construct for Technical Credit patterns.`,
    `File: ${context.fileName}`,
    `Language: ${context.language}`,
    context.importLines.length > 0
      ? `Imports:\n${context.importLines.join('\n')}`
      : null,
    adrSection,
    `Pre-extracted construct metrics (tree-sitter):\n${JSON.stringify(context.constructMetrics, null, 2)}`,
    `Class source:\n${context.constructMetrics.classSource}`,
  ]
    .filter(Boolean)
    .join('\n');
}
