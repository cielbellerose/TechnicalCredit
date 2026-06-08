import { loadMock, extractType } from './support/mockSource';

/**
 * H3 — constructor injection pattern (abstraction / configurability)
 *
 * Final fields set only in the constructor, or @Autowired on the constructor
 * (not on fields). The dependency is supplied from outside, so the
 * implementation can be substituted — the design anticipated change.
 *
 * Same shape as h1/h5: `cases` names a top-level type in MockTest.java and the
 * verdict we expect. The test extracts that construct (the slice a user would
 * highlight) and asserts against it.
 *
 * `h3category` (rather than `category`) records the category we expect the
 * detector to return for a positive — kept H3-specific to avoid confusion — and
 * is null for negatives. Confidence is intentionally omitted; it is not a
 * deterministic field to pin in a fixture test.
 *
 * Today this guards the fixtures (the construct exists, both polarities are
 * present). Once detection is wired, swap the TODO for a call that sends the
 * extracted code to Claude and assert against `expected`.
 */

// reads MockTest.java for testing
const MOCK = loadMock('MockTest.java');

interface H3Case {
  /** Type name exactly as declared in MockTest.java. */
  name: string;
  /** One line on why this construct is (or isn't) an H3 candidate. */
  rationale: string;
  /** Expected detector verdict (confidence omitted by design). */
  expected: {
    is_tc_candidate: boolean;
    /** Expected TC category for a positive; null for a negative. */
    h3category: 'abstraction' | 'configurability' | null;
  };
}

const cases: H3Case[] = [
  // --- Positive: constructor injection with all-final fields ---
  {
    name: 'OrderService',
    rationale:
      'Plain Java constructor injection — single final field set only in the constructor.',
    expected: { is_tc_candidate: true, h3category: 'abstraction' },
  },
  {
    name: 'NotificationService',
    rationale:
      'Spring @Autowired on the constructor (not fields); all collaborators are final.',
    expected: { is_tc_candidate: true, h3category: 'abstraction' },
  },
  {
    name: 'ReportBuilder',
    rationale:
      'Plain Java constructor injection — multiple final collaborators set only in the constructor.',
    expected: { is_tc_candidate: true, h3category: 'abstraction' },
  },

  // --- Negative: field-level or setter injection (no constructor seam) ---
  {
    name: 'UserController',
    rationale:
      'Field-level @Autowired on mutable (non-final) fields — no constructor seam, so not H3.',
    expected: { is_tc_candidate: false, h3category: null },
  },
  {
    name: 'EmailService',
    rationale:
      'Setter injection — dependency arrives after construction, field cannot be final, so not H3.',
    expected: { is_tc_candidate: false, h3category: null },
  },
];

describe('H3 — constructor injection pattern', () => {
  for (const c of cases) {
    const polarity = c.expected.is_tc_candidate ? 'positive' : 'negative';
    test(`${c.name} (${polarity}) — ${c.rationale}`, () => {
      const code = extractType(MOCK, c.name);

      // TODO: update to test JSON output
      expect(code).not.toBe(''); // currently only checks that construct must exist in MockTest.java
    });
  }
});
