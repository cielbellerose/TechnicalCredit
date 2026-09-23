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
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
