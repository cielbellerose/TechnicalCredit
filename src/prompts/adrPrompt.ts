import type { AdrSummary } from '@/context/findAdrs';
import type { TCResult } from '@/comment/tcResult';

export const ADR_SYSTEM_PROMPT = `You match a detected Technical Credit pattern to a repository's Architecture Decision Records (ADRs). Return JSON only, no prose.

Response format:
{ "adr": "ADR-nnnn" }  — the id of the ADR that clearly documents this pattern
{ "adr": null }        — if no ADR clearly documents this pattern`;

export function createAdrUserPrompt(
  result: TCResult,
  adrs: AdrSummary[],
): string {
  const patternLines = [
    `category: ${result.category}`,
    `benefit: ${result.benefit}`,
    result.signals.length > 0 ? `signals: ${result.signals.join(', ')}` : null,
    `conditions: ${result.conditions}`,
  ]
    .filter(Boolean)
    .join('\n');

  const adrLines = adrs
    .map((a) => [a.id, a.title, a.tcContext].filter(Boolean).join(' — '))
    .join('\n');

  return `Technical Credit pattern detected:\n${patternLines}\n\nRepository ADRs:\n${adrLines}\n\nWhich ADR, if any, clearly documents this pattern?`;
}
