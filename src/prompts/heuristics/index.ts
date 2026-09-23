import { prompt as creational } from './creational';
import { prompt as structural } from './structural';
import { prompt as behavioral } from './behavioral';

export const HEURISTIC_CATEGORIES = [
  'creational',
  'structural',
  'behavioral',
] as const;

export type HeuristicCategory = (typeof HEURISTIC_CATEGORIES)[number];

/** The Gang of Four design patterns detected within each category. */
export const DESIGN_PATTERNS = {
  creational: [
    'singleton',
    'abstract-factory',
    'factory-method',
    'prototype',
    'builder',
  ],
  structural: [
    'adapter',
    'bridge',
    'composite',
    'decorator',
    'facade',
    'flyweight',
    'proxy',
  ],
  behavioral: [
    'chain-of-responsibility',
    'command',
    'interpreter',
    'iterator',
    'mediator',
    'memento',
    'observer',
    'state',
    'strategy',
    'template-method',
    'visitor',
  ],
} as const satisfies Record<HeuristicCategory, readonly string[]>;

/** A design pattern belonging to category `C` (any category by default). */
export type DesignPattern<C extends HeuristicCategory = HeuristicCategory> =
  (typeof DESIGN_PATTERNS)[C][number];

/** A category's detection prompt: shared rules plus one section per design pattern. */
export interface CategoryPrompt<C extends HeuristicCategory> {
  rules: string;
  patterns: Record<DesignPattern<C>, string>;
}

const categoryPrompts: { [C in HeuristicCategory]: CategoryPrompt<C> } = {
  creational,
  structural,
  behavioral,
};

/** Returns the raw detection criteria for a category (no category header). Used by OPRO to optimize criteria in isolation. */
export function getHeuristicCriteria(heuristic: HeuristicCategory): string {
  const { rules, patterns } = categoryPrompts[heuristic];
  const sections = Object.entries(patterns).map(
    ([pattern, criteria]) => `### ${pattern}\n${criteria}`,
  );
  return `${rules}\n\n## Design Patterns\n\n${sections.join('\n\n')}`;
}

/** Returns the full category prompt including a category header. Use this everywhere outside OPRO. */
export function createHeuristicPrompt(heuristic: HeuristicCategory): string {
  const label = heuristic.toUpperCase();
  return `Detecting: ${label} design patterns as Technical Credit.\n\n${getHeuristicCriteria(heuristic)}`;
}
