import { prompt as abstraction } from './abstraction';
import { prompt as modularity } from './modularity';
import { prompt as apiStability } from './api-stability';
import { prompt as automation } from './automation';
import { prompt as knowledgePreservation } from './knowledge-preservation';
import { prompt as configurability } from './configurability';
import { prompt as observability } from './observability';
import { prompt as reusability } from './reusability';
import { prompt as complianceReadiness } from './compliance-readiness';

export const HEURISTIC_CATEGORIES = [
  'abstraction',
  'modularity',
  'api-stability',
  'automation',
  'knowledge-preservation',
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
  'knowledge-preservation': knowledgePreservation,
  configurability,
  observability,
  reusability,
  'compliance-readiness': complianceReadiness,
};

export function createHeuristicPrompt(heuristic: HeuristicCategory): string {
  return heuristicPrompts[heuristic];
}
