import { analyseConstruct } from '../support/analyseLive';

/**
 * H1 — interface with no fields → abstraction.
 *
 * Each test sends one MockTest.java construct to Claude for a live analysis
 * and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

describe('H1 — interface with no fields', () => {
  // --- Positive: interfaces with no fields ---

  test('EventListener → abstraction (single-method interface, no fields)', async () => {
    const result = await analyseConstruct('EventListener');

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
    expect(result.benefit.toLowerCase()).toMatch(
      /abstract|decoupl|contract|implement|interface/,
    );
  });

  test('Validator → abstraction (one method, no fields)', async () => {
    const result = await analyseConstruct('Validator');

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  test('Greetable → abstraction (one void method, no fields)', async () => {
    const result = await analyseConstruct('Greetable');

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  // --- Negative: not an interface, or interface with fields ---

  test('Calculator → not TC (concrete class, not an interface)', async () => {
    const result = await analyseConstruct('Calculator');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Constants → not TC (interface, but it has fields — H1 requires none)', async () => {
    const result = await analyseConstruct('Constants');

    expect(result.is_tc_candidate).toBe(false);
  });
});
