import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Prototype — Negative Tests
 *
 * Looking for: an interface/abstract class that declares a clone() method
 * returning its own type, implemented by concrete classes that copy an
 * existing instance instead of being built from scratch.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Negative.java');

const CATEGORY: HeuristicCategory = 'creational';

describe('Prototype: negative', () => {
  test('ContactCard → not prototype (copy constructor + snapshot() returning an unrelated type, no clone() contract)', async () => {
    const result = await analyseConstruct('ContactCard', CATEGORY, MOCK_FILE);

    expect(result.design_patterns).not.toContain('prototype');
  });

  test('Invoice → not prototype (copyWith() takes an extra parameter, not a no-arg clone() contract)', async () => {
    const result = await analyseConstruct('Invoice', CATEGORY, MOCK_FILE);

    expect(result.design_patterns).not.toContain('prototype');
  });

  test('Point → not prototype (private copy constructor only, no clone() contract, nothing implements/extends it)', async () => {
    const result = await analyseConstruct('Point', CATEGORY, MOCK_FILE);

    expect(result.design_patterns).not.toContain('prototype');
  });
});
