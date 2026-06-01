/**
 * H1 expectations: interface with no fields → abstraction.
 *
 * This catalog names the constructs in MockTest.java that are H1 technical-
 * credit candidates (positives) and those that are not (negatives). The Java
 * itself lives in MockTest.java — the source of truth for sample code — and
 * h1.test.ts asserts that every name below is declared there, with both
 * polarities represented.
 *
 * As new heuristics land, add a sibling `<heuristic>expectations.ts` catalog
 * and grow the mock code files with matching positive/negative examples.
 */
export interface H1Expectation {
  /** Type name exactly as declared in MockTest.java. */
  name: string;
  rationale: string;
  /**
   * Placeholder detector verdict we expect for this construct once H1 detection
   * exists. `true` = H1 positive (TC candidate); `false` = negative.
   */
  expected: { is_tc_candidate: boolean };
}

export const h1Expectations: H1Expectation[] = [
  // --- Positive cases: interfaces with no fields ---
  {
    name: "EventListener",
    rationale: "Single-method interface, no fields — classic abstraction.",
    expected: { is_tc_candidate: true },
  },
  {
    name: "Validator",
    rationale: "Interface with one method and no fields.",
    expected: { is_tc_candidate: true },
  },
  {
    name: "Greetable",
    rationale: "Interface with one void method and no fields.",
    expected: { is_tc_candidate: true },
  },

  // --- Negative cases: not interfaces, or interfaces with fields ---
  {
    name: "Calculator",
    rationale: "Concrete class — not an interface, so not H1.",
    expected: { is_tc_candidate: false },
  },
  {
    name: "Constants",
    rationale: "Is an interface, but it has fields — H1 requires no fields.",
    expected: { is_tc_candidate: false },
  },
];
