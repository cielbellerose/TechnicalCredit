import { analyseConstruct } from '../support/analyseLive';

/**
 * H5 — Micrometer / structured-logging usage (observability).
 *
 * Each test sends one MockTest.java construct to Claude for a live analysis
 * and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

describe('H5 — Micrometer / structured logging', () => {
  // --- Positive: Micrometer or structured-logging / MDC usage ---

  test('OrderMetrics → observability (MeterRegistry + counter("orders.placed"))', async () => {
    const result = await analyseConstruct('OrderMetrics', 'observability');

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('observability');
    expect(result.benefit.toLowerCase()).toMatch(
      /metric|observ|monitor|instrument|telemetr/,
    );
  });

  test('PaymentProcessor → observability (@Timed instruments method latency)', async () => {
    const result = await analyseConstruct('PaymentProcessor', 'observability');

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('observability');
    expect(result.benefit.toLowerCase()).toMatch(
      /metric|observ|monitor|instrument|telemetr|latency/,
    );
  });

  test('AuditLogger → observability (MDC.put + structured key=value log line)', async () => {
    const result = await analyseConstruct('AuditLogger', 'observability');

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('observability');
    expect(result.benefit.toLowerCase()).toMatch(
      /metric|observ|monitor|instrument|telemetr|log|structur/,
    );
  });

  // --- Negative: logs, but no observability infrastructure ---

  test('NaivePrinter → not TC (println string concat, no Micrometer/MDC)', async () => {
    const result = await analyseConstruct('NaivePrinter', 'observability');

    expect(result.is_tc_candidate).toBe(false);
  });

  // --- Negative: near-miss signals (the precision guards) ---

  test('UnstructuredLogger → not TC (real SLF4J logger, but string concat)', async () => {
    const result = await analyseConstruct(
      'UnstructuredLogger',
      'observability',
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('MdcDecoder → not TC (MDC is an unrelated acronym; just computes numbers)', async () => {
    const result = await analyseConstruct('MdcDecoder', 'observability');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('ReflectiveLoader → not TC (io.micrometer token only in a string literal/comment)', async () => {
    const result = await analyseConstruct('ReflectiveLoader', 'observability');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('MdcDecoder → not TC (MDC is an unrelated acronym; just computes numbers)', async () => {
    const result = await analyseConstruct('MdcDecoder');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('ReflectiveLoader → not TC (io.micrometer token only in a string literal/comment)', async () => {
    const result = await analyseConstruct('ReflectiveLoader');

    expect(result.is_tc_candidate).toBe(false);
  });
});
