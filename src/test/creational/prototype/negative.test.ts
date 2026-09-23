import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';

/**
 * Creational: Prototype — Negative Tests
 *
 * Looking for: an interface/abstract class that declares a clone() method
 * returning its own type, implemented by concrete classes that copy an
 * existing instance instead of being built from scratch.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Prototype.java');

describe('Prototype: negative', () => {
  test('ContactCard → not TC (copy constructor + snapshot() returning an unrelated type, no clone() contract)', async () => {
    const result = await analyseConstruct(
      'ContactCard',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Invoice → not TC (copyWith() takes an extra parameter, not a no-arg clone() contract)', async () => {
    const result = await analyseConstruct('Invoice', 'abstraction', MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Point → not TC (private copy constructor only, no clone() contract, nothing implements/extends it)', async () => {
    const result = await analyseConstruct('Point', 'abstraction', MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });
});
