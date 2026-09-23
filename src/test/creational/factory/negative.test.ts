import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Factory Method — Negative Tests
 *
 * Looking for: an abstract creator class with an abstract factory method,
 * extended by concrete creators that decide which product to instantiate,
 * while the creator's own logic only refers to the abstract product.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Negative.java');

const CATEGORY = 'factory-method' as HeuristicCategory;

describe('Factory Method: negative', () => {
  test('ReportPrinter → not TC (concrete class directly news a concrete product, no abstract creator)', async () => {
    const result = await analyseConstruct('ReportPrinter', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('InvoiceService → not TC (createInvoice() is concrete and never overridden)', async () => {
    const result = await analyseConstruct(
      'InvoiceService',
      CATEGORY,
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('ShapeFactory → not TC (static simple factory, no abstract creator or subclassing)', async () => {
    const result = await analyseConstruct('ShapeFactory', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });
});
