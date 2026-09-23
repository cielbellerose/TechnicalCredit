/**
 * The structured Technical Credit analysis that drives the CodeLens preview.
 * This is the stable interface between the model's output and the comment rendering,
 * extracted here for better testability and to decouple from the formatting logic.
 */

import type { DesignPattern, Category } from '@/prompts/categories';

/** Fields shared by every category's result. */
interface TCResultFields {
  is_tc_candidate: boolean;
  benefit: string;
  conditions: string;
  signals: string[];
  not_tc_reason: string | null;
  adr?: string | null;
}

/**
 * The structured Technical Credit analysis returned by the model for one category.
 * A union over categories so `design_patterns` can only hold patterns from `category`.
 */
export type TCResult = {
  [C in Category]: TCResultFields & {
    category: C;
    design_patterns: DesignPattern<C>[];
  };
}[Category];
