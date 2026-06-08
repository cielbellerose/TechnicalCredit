import { loadMock, extractType } from './support/mockSource';
import { H4_SUFFIX_PATTERN, h4Cases } from './support/h4Cases';

/** The valid TC categories H4 can land in (null is handled separately). */
const H4_CATEGORIES = ['abstraction', 'reusability'];

/**
 * H4 — class-name suffix matching → abstraction / reusability.
 *
 * The catalog lives in support/h4Cases.ts (shared with the live eval). Each
 * row names a top-level type in MockTest.java and the verdict we expect; this
 * test extracts that construct (the code a user would highlight) and guards
 * the fixtures.
 *
 * Four guards run here, deterministically and offline:
 *   1. the construct exists in MockTest.java (both polarities present),
 *   2. the type name agrees with the H4 suffix regex — i.e. `suffixMatch`
 *      in the catalog matches what the pattern list actually sees. This pins
 *      the AccountService precision trap (suffix matches, but not TC),
 *   3. `signals` are exactly the suffix token(s) the regex fires on — empty
 *      iff the name doesn't match — so the evidence can't drift from the
 *      pattern list, and
 *   4. `expected.H4Category` is null exactly when the case isn't a candidate,
 *      and a valid category otherwise.
 *
 * Like h1.test.ts, this only guards the fixtures today. The remaining verdict
 * field (is_tc_candidate) is documentation for now. TODO: once detection is
 * wired, send the extracted code to Claude with SYSTEM_PROMPT and assert
 * against c.expected, recording false positives / negatives (esp. the
 * AccountService precision trap) for prompt iteration.
 */

// reads MockTest.java for testing
const MOCK = loadMock('MockTest.java');

describe('H4 — class-name suffix matching', () => {
  for (const c of h4Cases) {
    const polarity = c.expected.is_tc_candidate ? 'positive' : 'negative';
    test(`${c.name} (${polarity}) — ${c.rationale}`, () => {
      const code = extractType(MOCK, c.name);
      expect(code).not.toBe(''); // construct must exist in MockTest.java

      // The name's suffix-match status must match what the catalog claims,
      expect(H4_SUFFIX_PATTERN.test(c.name)).toBe(c.suffixMatch);

      // signals must be exactly the suffix token(s) the regex fires on:
      // the captured suffix when it matches, empty otherwise.
      const match = c.name.match(H4_SUFFIX_PATTERN);
      expect(c.signals).toEqual(match ? [match[1]] : []);

      // category is null exactly when the case isn't a candidate, and a valid
      // category otherwise.
      if (c.expected.is_tc_candidate) {
        expect(H4_CATEGORIES).toContain(c.expected.H4Category);
      } else {
        expect(c.expected.H4Category).toBeNull();
      }
    });
  }
});
