import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { Category } from '@/prompts/categories';

/**
 * Creational: Prototype — Positive Tests
 *
 * Looking for: an interface/abstract class that declares a clone() method
 * returning its own type, implemented by concrete classes that copy an
 * existing instance instead of being built from scratch.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Positive.java');

const CATEGORY: Category = 'creational';

describe('Prototype: positive', () => {
  test('Shape → TC (interface declares clone() returning its own type, implemented by Circle)', async () => {
    const result = await analyseConstruct('Shape', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('creational');
    expect(result.design_patterns).toContain('prototype');
  });

  test('Animal → TC (abstract class declares clone() returning its own type, extended by Dog)', async () => {
    const result = await analyseConstruct('Animal', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('creational');
    expect(result.design_patterns).toContain('prototype');
  });

  test('Document → TC (interface declares clone() returning its own type, implemented by TextDocument)', async () => {
    const result = await analyseConstruct('Document', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('creational');
    expect(result.design_patterns).toContain('prototype');
  });
});
