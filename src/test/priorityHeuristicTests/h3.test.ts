import { analyseConstruct } from '../support/analyseLive';

/**
 * H3 — constructor injection pattern (abstraction / configurability).
 *
 * Each test sends one MockTest.java construct to Claude for a live analysis
 * and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

/** The valid TC categories H3 can land in. */
const H3_CATEGORIES = ['abstraction', 'configurability'];

describe('H3 — constructor injection pattern', () => {
  // --- Positive: constructor injection with all-final fields ---

  test('OrderService → abstraction (plain Java constructor injection, single final field)', async () => {
    const result = await analyseConstruct('OrderService', 'abstraction');

    expect(result.is_tc_candidate).toBe(true);
    expect(H3_CATEGORIES).toContain(result.category);
  });

  test('NotificationService → abstraction (@Autowired on constructor, all collaborators final)', async () => {
    const result = await analyseConstruct('NotificationService', 'abstraction');

    expect(result.is_tc_candidate).toBe(true);
    expect(H3_CATEGORIES).toContain(result.category);
  });

  test('ReportBuilder → abstraction (multiple final collaborators set only in constructor)', async () => {
    const result = await analyseConstruct('ReportBuilder', 'abstraction');

    expect(result.is_tc_candidate).toBe(true);
    expect(H3_CATEGORIES).toContain(result.category);
  });

  // --- Negative: field-level or setter injection ---

  test('UserController → not TC (field-level @Autowired on mutable fields, no constructor seam)', async () => {
    const result = await analyseConstruct('UserController', 'abstraction');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('EmailService → not TC (setter injection, dependency arrives after construction)', async () => {
    const result = await analyseConstruct('EmailService', 'abstraction');

    expect(result.is_tc_candidate).toBe(false);
  });
});
