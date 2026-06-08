import { analyseConstruct } from './support/analyseLive';

/**
 * H4 — class-name suffix matching → abstraction / reusability.
 *
 * Each test sends one MockTest.java construct to Claude for a live analysis
 * and asserts the parsed output.
 *
 */
jest.setTimeout(60_000);

/** The valid TC categories H4 can land in. */
const H4_CATEGORIES = ['abstraction', 'reusability'];

describe('H4 — class-name suffix matching', () => {
  // --- Positive: suffix match AND a meaningful abstraction ---

  test('StripeGateway → TC (Gateway suffix, adapts an external payment provider)', async () => {
    const result = await analyseConstruct('StripeGateway');

    expect(result.is_tc_candidate).toBe(true);
    expect(H4_CATEGORIES).toContain(result.category);
  });

  test('OrderFactory → TC (Factory suffix, centralises Order construction)', async () => {
    const result = await analyseConstruct('OrderFactory');

    expect(result.is_tc_candidate).toBe(true);
    expect(H4_CATEGORIES).toContain(result.category);
  });

  test('PricingStrategy → TC (Strategy suffix, pluggable pricing algorithm)', async () => {
    const result = await analyseConstruct('PricingStrategy');

    expect(result.is_tc_candidate).toBe(true);
    expect(H4_CATEGORIES).toContain(result.category);
  });

  test('HttpClientBuilder → TC (Builder suffix, fluent immutable construction)', async () => {
    const result = await analyseConstruct('HttpClientBuilder');

    expect(result.is_tc_candidate).toBe(true);
    expect(H4_CATEGORIES).toContain(result.category);
  });

  // --- Negative: suffix matches but no real abstraction, or no suffix at all ---

  test('AccountService → not TC (Service suffix, but a plain data holder — precision guard)', async () => {
    const result = await analyseConstruct('AccountService');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('StringUtils → not TC (no suffix match; trivial stateless helper)', async () => {
    const result = await analyseConstruct('StringUtils');

    expect(result.is_tc_candidate).toBe(false);
  });
});
