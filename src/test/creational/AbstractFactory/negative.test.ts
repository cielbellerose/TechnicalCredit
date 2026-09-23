import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';

/**
 * Creational: Abstract Factory — Negative Tests
 *
 * Looking for: a top-level interface declaring one creation method per member
 * of a product family, implemented by concrete factories, alongside abstract
 * product interfaces implemented by the concrete products those factories return.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Negative.java');

describe('Abstract Factory: negative', () => {
  test('ConnectionFactory → not TC (factory-shaped class directly news a single concrete, unrelated type, no shared product interface)', async () => {
    const result = await analyseConstruct(
      'ConnectionFactory',
      'abstract',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('ReportBundler → not TC (create methods return different concrete types with no shared interface - not a coherent product family)', async () => {
    const result = await analyseConstruct(
      'ReportBundler',
      'abstract',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('OrderProcessor → not TC (plain business logic class building its own concrete helpers inline, no factory or product abstraction)', async () => {
    const result = await analyseConstruct(
      'OrderProcessor',
      'abstract',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
