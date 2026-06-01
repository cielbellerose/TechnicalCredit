import { loadMock, extractType } from "./support/mockSource";

/**
 * H1 — interface with no fields → abstraction.
 *
 * `cases` is the catalog: each row names a top-level type in MockTest.java and
 * the verdict we expect for it. The test extracts that construct (the code a
 * user would highlight) from the mock file and asserts against it.
 *
 * To scale: add a row below AND the matching construct in MockTest.java.
 *
 * Today this guards the fixtures (the construct exists, both polarities are
 * present). Once detection is wired, swap the TODO for a call that sends the
 * extracted code to Claude and assert `toMatchObject(c.expected)` — grow
 * `expected` into the full JSON contract (category, confidence, …), pinning
 * only the deterministic fields.
 */

// reads MockTest.java for testing
const MOCK = loadMock("MockTest.java");

interface H1Case {
  /** Type name exactly as declared in MockTest.java. */
  name: string;
  /** One line on why this construct is (or isn't) an H1 candidate. */
  rationale: string;
  /** Expected detector verdict. `true` = H1 positive (TC candidate). */
  expected: { is_tc_candidate: boolean };
}

const cases: H1Case[] = [
  // --- Positive: interfaces with no fields ---
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

  // --- Negative: not an interface, or interface with fields ---
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

describe("H1 — interface with no fields", () => {
  for (const c of cases) {
    const polarity = c.expected.is_tc_candidate ? "positive" : "negative";
    test(`${c.name} (${polarity}) — ${c.rationale}`, () => {
      const code = extractType(MOCK, c.name);
      expect(code).not.toBe(""); // currently only checks that construct must exist in MockTest.java
    });
  }
});
