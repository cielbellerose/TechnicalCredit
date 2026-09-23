import * as path from 'path';

import { analyseConstruct } from '../../../../support/analyseLive';

/**
 * Creational: Factory Method — Negative Tests
 *
 * Signal: an abstract class declares an abstract factory method, concrete
 * subclasses extend it to decide which product to instantiate, and the
 * implementation refers to the abstract type.
 *
 * Each test sends one factory-method.java construct to Claude for a live
 * analysis and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'factory-method.java');

describe('Factory Method: negative', () => {
  test('ReportPrinter → not TC (concrete class directly news a concrete product, no abstract creator)', async () => {
    const result = await analyseConstruct(
      'ReportPrinter',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
