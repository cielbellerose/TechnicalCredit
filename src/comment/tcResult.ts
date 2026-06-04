/**
 * The structured Technical Credit analysis that drives the CodeLens preview.
 * This is the stable interface between the model's output and the comment rendering,
 * extracted here for better testability and to decouple from the formatting logic.
 */

/** The eight Technical Credit categories the model may assign. */
export type TCCategory =
  | 'abstraction'
  | 'modularity'
  | 'api-stability'
  | 'automation'
  | 'compliance-readiness'
  | 'configurability'
  | 'observability'
  | 'reusability';

/** The structured Technical Credit analysis returned by the model. */
export interface TCResult {
  is_tc_candidate: boolean;
  confidence: number;
  category: TCCategory;
  benefit: string;
  conditions: string;
  signals: string[];
  not_tc_reason: string | null;
}
