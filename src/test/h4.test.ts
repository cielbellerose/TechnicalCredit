import { loadMock, extractType } from './support/mockSource';
import { H4_SUFFIX_PATTERN, h4Cases } from './support/h4Cases';

/**
 * H4 — class-name suffix matching → abstraction / reusability.
 *
 * The catalog lives in support/h4Cases.ts (shared with the live eval). Each
 * row names a top-level type in MockTest.java and the verdict we expect; this
 * test extracts that construct (the code a user would highlight) and guards
 * the fixtures.
 *
 * Two guards run here, deterministically and offline:
 *   1. the construct exists in MockTest.java (both polarities present), and
 *   2. the type name agrees with the H4 suffix regex — i.e. `suffixMatch`
 *      in the catalog matches what the pattern list actually sees. This pins
 *      the AccountService precision trap (suffix matches, but not TC).
 *
 * Like h1.test.ts, this only guards the fixtures today. The verdict fields on
 * each case (is_tc_candidate / category) are documentation for
 * now. TODO: once detection is wired, send the extracted code to Claude with
 * SYSTEM_PROMPT and assert against c.expected, recording false positives /
 * negatives (esp. the AccountService precision trap) for prompt iteration.
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
      // so the pattern list and the fixtures can't silently drift apart.
      expect(H4_SUFFIX_PATTERN.test(c.name)).toBe(c.suffixMatch);
    });
  }
});
