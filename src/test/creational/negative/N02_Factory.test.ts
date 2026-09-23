import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';

/**
 * Creational: Factory Method — negative tests. Each test sends one
 * N02_Factory.java construct to Claude for a live analysis.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'N02_Factory.java');

describe('Factory Method: negative', () => {
  test('ReportPrinter → not TC (concrete class directly news a concrete product, no abstract creator)', async () => {
    const result = await analyseConstruct(
      'ReportPrinter',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('InvoiceService → not TC (createInvoice() is concrete and never overridden)', async () => {
    const result = await analyseConstruct(
      'InvoiceService',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('ShapeFactory → not TC (static simple factory, no abstract creator or subclassing)', async () => {
    const result = await analyseConstruct(
      'ShapeFactory',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
