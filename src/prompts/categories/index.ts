import { signals as abstraction } from './abstraction';
import { signals as modularity } from './modularity';
import { signals as apiStability } from './api-stability';
import { signals as automation } from './automation';
import { signals as configurability } from './configurability';
import { signals as observability } from './observability';
import { signals as reusability } from './reusability';
import { signals as complianceReadiness } from './compliance-readiness';
import { Signal } from './types';

export type { Signal } from './types';

export const HEURISTIC_CATEGORIES = [
  'abstraction',
  'modularity',
  'api-stability',
  'automation',
  'configurability',
  'observability',
  'reusability',
  'compliance-readiness',
] as const;

export type HeuristicCategory = (typeof HEURISTIC_CATEGORIES)[number];

/** The allowlist of signals each category is permitted to emit. */
const categorySignals: Record<HeuristicCategory, Signal[]> = {
  abstraction,
  modularity,
  'api-stability': apiStability,
  automation,
  configurability,
  observability,
  reusability,
  'compliance-readiness': complianceReadiness,
};

/** Returns the signals a category is allowed to assign. */
export function getCategorySignals(heuristic: HeuristicCategory): Signal[] {
  return categorySignals[heuristic];
}

/** Renders a category's signal allowlist as a documented bullet list (signal: when to assign). */
function renderSignalAllowlist(heuristic: HeuristicCategory): string {
  return categorySignals[heuristic]
    .map((s) => `- ${s.name}: ${s.when}`)
    .join('\n');
}

/** Returns the raw signal allowlist for a heuristic (no category header). Used by OPRO to optimize criteria in isolation. */
export function getHeuristicCriteria(heuristic: HeuristicCategory): string {
  return renderSignalAllowlist(heuristic);
}

/** Returns the full heuristic prompt: a category header plus the restricted signal allowlist. Use this everywhere outside OPRO. */
export function createHeuristicPrompt(heuristic: HeuristicCategory): string {
  const label = heuristic.toUpperCase().replace(/-/g, ' ');
  return `Detecting: ${label} Technical Credit.

Assign signals ONLY from the allowlist below, and only when the code matches the signal's definition. Do not invent new signals, and do not borrow signals from other categories. Put the assigned signal names verbatim in the "signals" field. If the construct matches none of these signals, it is not ${label} TC.

Allowed signals for ${heuristic} (signal: when to assign):
${renderSignalAllowlist(heuristic)}`;
}
