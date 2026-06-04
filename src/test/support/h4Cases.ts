/**
 * H4 — class-name suffix matching → abstraction / reusability.
 *
 * H4 (see systemPrompt.ts) is a *high-recall* heuristic: any class whose name
 * ends in one of the TC pattern suffixes is surfaced as a candidate. Recall is
 * high, precision is only "acceptable" — so the interesting test cases are the
 * ones where the suffix matches but no real abstraction exists.
 *
 * This module is the single source of truth for the H4 catalog. h4.test.ts
 * consumes it today for the fixture + suffix-regex guard; the same catalog is
 * ready to drive a future live evaluation against the H4 prompt (the TODO in
 * h4.test.ts) without restating the cases.
 *
 * To scale: add a row to `h4Cases` AND the matching construct in MockTest.java.
 */

/**
 * The H4 pattern list, anchored as a *suffix* (the heuristic is "class name
 * suffix matching"). `AccountService` matches; `ServiceLocator` would not.
 */
export const H4_SUFFIX_PATTERN =
  /(Adapter|Repository|Gateway|Port|Service|Strategy|Factory|Builder|Policy)$/;

/** The TC categories H4 can land in. */
export type H4Category = 'abstraction' | 'reusability';

export interface H4Case {
  /** Type name exactly as declared in MockTest.java. */
  name: string;
  /** One line on why this is (or isn't) a genuine H4 candidate. */
  rationale: string;
  /**
   * Whether the *name alone* matches {@link H4_SUFFIX_PATTERN} — i.e. what the
   * raw heuristic sees, before any judgement of real abstraction. Negatives
   * with `suffixMatch: true` are the precision (false-positive) guards.
   */
  suffixMatch: boolean;
  /**
   * The H4 signal(s) the name fires — the suffix token(s) from the pattern list
   * (Adapter|Repository|Gateway|Port|Service|Strategy|Factory|Builder|Policy)
   * present in the name. Empty when none match, so it lines up with
   * `suffixMatch: false`. This is the evidence H4 actually keys on.
   */
  signals: string[];
  /**
   * The verdict a careful reviewer would give — the ground truth the live eval
   * compares Claude's output against.
   *
   * `is_tc_candidate` is the primary assertion. `category` is the expected TC
   * category (null when not a candidate).
   */
  expected: {
    is_tc_candidate: boolean;
    category: H4Category | null;
  };
}

export const h4Cases: H4Case[] = [
  // --- Positives: suffix match AND a meaningful abstraction ---
  {
    name: 'StripeGateway',
    rationale:
      'Gateway suffix; adapts an external payment provider behind the PaymentGateway interface — textbook abstraction seam.',
    suffixMatch: true,
    signals: ['Gateway'],
    expected: { is_tc_candidate: true, category: 'reusability' },
  },
  {
    name: 'OrderFactory',
    rationale:
      'Factory suffix; centralises Order construction behind named creation methods, decoupling callers from the constructor.',
    suffixMatch: true,
    signals: ['Factory'],
    expected: { is_tc_candidate: true, category: 'reusability' },
  },
  {
    name: 'PricingStrategy',
    rationale:
      'Strategy suffix; interface for a pluggable pricing algorithm selected at runtime — extension point.',
    suffixMatch: true,
    signals: ['Strategy'],
    expected: { is_tc_candidate: true, category: 'reusability' },
  },
  {
    name: 'HttpClientBuilder',
    rationale:
      'Builder suffix; fluent, immutable construction of HttpClient — reusable configuration abstraction.',
    suffixMatch: true,
    signals: ['Builder'],
    expected: { is_tc_candidate: true, category: 'reusability' },
  },

  // --- Negatives ---
  {
    name: 'AccountService',
    rationale:
      'Service suffix MATCHES, but it is a plain data holder (fields + getters/setters, no behaviour, no abstraction). Precision guard: H4 recall flags the name, the verdict should not.',
    suffixMatch: true,
    signals: ['Service'],
    expected: { is_tc_candidate: false, category: null },
  },
  {
    name: 'StringUtils',
    rationale:
      'No suffix match (Utils is not in the pattern list); trivial stateless helper — outside H4 entirely.',
    suffixMatch: false,
    signals: [],
    expected: { is_tc_candidate: false, category: null },
  },
];
