import { loadMock, extractType } from './support/mockSource';

/**
 * H5 — Micrometer / structured-logging usage (observability)
 *
 * import_declaration matching io.micrometer.* or MDC usage in method bodies
 */

// reads MockTest.java for testing
const MOCK = loadMock('MockTest.java');

interface H5Case {
  /** Type name exactly as declared in MockTest.java. */
  name: string;
  /** One line on why this construct is (or isn't) an H5 candidate. */
  rationale: string;
  /** Expected detector verdict. `true` = H5 positive (observability TC). */
  expected: { is_tc_candidate: boolean };
}

const cases: H5Case[] = [
  // --- Positive: Micrometer or structured-logging / MDC usage ---
  {
    name: 'OrderMetrics',
    rationale:
      'Micrometer MeterRegistry field + counter("orders.placed") usage.',
    expected: { is_tc_candidate: true },
  },
  {
    name: 'PaymentProcessor',
    rationale: '@Timed annotation instruments method latency — Micrometer.',
    expected: { is_tc_candidate: true },
  },
  {
    name: 'AuditLogger',
    rationale: 'MDC.put + structured key=value log line, not string concat.',
    expected: { is_tc_candidate: true },
  },

  // --- Negative: logs, but no observability infrastructure ---
  {
    name: 'NaivePrinter',
    rationale:
      'println string concatenation — no Micrometer, no MDC, no key=value.',
    expected: { is_tc_candidate: false },
  },

  // --- Negative: near-miss signals (the precision guards) ---
  {
    name: 'UnstructuredLogger',
    rationale:
      'Real SLF4J logger but string concat — "uses a logger" is not structured logging.',
    expected: { is_tc_candidate: false },
  },
  {
    name: 'ReflectiveLoader',
    rationale:
      'io.micrometer token only in a String literal and a comment — not a real import/call.',
    expected: { is_tc_candidate: false },
  },
  {
    name: 'MdcDecoder',
    rationale:
      'MDC is an unrelated acronym here; just computes numbers — no observability infra.',
    expected: { is_tc_candidate: false },
  },
];

describe('H5 — Micrometer / structured logging', () => {
  for (const c of cases) {
    const polarity = c.expected.is_tc_candidate ? 'positive' : 'negative';
    test(`${c.name} (${polarity}) — ${c.rationale}`, () => {
      const code = extractType(MOCK, c.name);

      // TODO: update to test JSON output
      expect(code).not.toBe(''); // currently only checks that construct must exist in MockTest.java
    });
  }
});
