import { prompt as abstraction } from './abstraction';
import { prompt as modularity } from './modularity';
import { prompt as apiStability } from './api-stability';
import { prompt as automation } from './automation';
import { prompt as configurability } from './configurability';
import { prompt as observability } from './observability';
import { prompt as reusability } from './reusability';
import { prompt as complianceReadiness } from './compliance-readiness';

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

const heuristicPrompts: Record<HeuristicCategory, string> = {
  abstraction,
  modularity,
  'api-stability': apiStability,
  automation,
  configurability,
  observability,
  reusability,
  'compliance-readiness': complianceReadiness,
};

/** Returns the raw detection criteria for a heuristic (no category header). Used by OPRO to optimize criteria in isolation. */
export function getHeuristicCriteria(heuristic: HeuristicCategory): string {
  return heuristicPrompts[heuristic];
}

/** Returns the full heuristic prompt including a category header. Use this everywhere outside OPRO. */
export function createHeuristicPrompt(heuristic: HeuristicCategory): string {
  const label = heuristic.toUpperCase().replace(/-/g, ' ');
  return `Detecting: ${label} Technical Credit.\n\n${heuristicPrompts[heuristic]}`;
}
