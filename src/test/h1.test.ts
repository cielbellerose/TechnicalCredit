import * as fs from "fs";
import * as path from "path";

import { h1Expectations } from "./h1expectations";

/**
 * H1 fixture coverage: confirms the mock corpus holds the H1 examples we claim.
 *
 * This does NOT run detection — it guards the fixtures. Every type named in
 * h1expectations.ts must be declared in MockTest.java, and the file must carry
 * both positive and negative H1 cases so the corpus stays balanced as it grows.
 * (Whether each type is *semantically* H1 is the detector's job, not asserted
 * here.)
 */

const MOCK = fs.readFileSync(
  path.join(__dirname, "mockCode", "MockTest.java"),
  "utf8",
);

/** True if `source` declares a top-level type with the given name. */
function declaresType(source: string, name: string): boolean {
  return new RegExp(`\\b(class|interface|enum|record)\\s+${name}\\b`).test(
    source,
  );
}

describe("MockTest.java — H1 fixture coverage", () => {
  for (const e of h1Expectations) {
    const polarity = e.expected.is_tc_candidate ? "positive" : "negative";
    test(`declares ${e.name} (${polarity}) — ${e.rationale}`, () => {
      expect(declaresType(MOCK, e.name)).toBe(true);
    });
  }

  test("contains at least one H1 positive case", () => {
    const positives = h1Expectations.filter((e) => e.expected.is_tc_candidate);
    expect(positives.length).toBeGreaterThan(0);
    expect(positives.every((e) => declaresType(MOCK, e.name))).toBe(true);
  });

  test("contains at least one H1 negative case", () => {
    const negatives = h1Expectations.filter((e) => !e.expected.is_tc_candidate);
    expect(negatives.length).toBeGreaterThan(0);
    expect(negatives.every((e) => declaresType(MOCK, e.name))).toBe(true);
  });
});
