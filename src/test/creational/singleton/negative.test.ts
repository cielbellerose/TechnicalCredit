import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Singleton — Negative Tests
 *
 * Looking for: a class (or enum) that guarantees a single instance and
 * exposes it through a global access point — double-checked locking,
 * Bill Pugh holder, or a data-holding enum.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Negative.java');

const CATEGORY = 'singleton' as HeuristicCategory;

describe('Singleton: negative', () => {
  test('ReceiptFactory → not TC (private constructor, but static factory returns a new Receipt every call)', async () => {
    const result = await analyseConstruct(
      'ReceiptFactory',
      CATEGORY,
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Session → not TC (getInstance() is named like a singleton accessor but returns a new instance each call)', async () => {
    const result = await analyseConstruct('Session', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('StringUtils → not TC (static utility class, private constructor and no instance at all)', async () => {
    const result = await analyseConstruct('StringUtils', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Counter → not TC (public constructor lets callers create many instances)', async () => {
    const result = await analyseConstruct('Counter', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Color → not TC (plain enum of constants, no state)', async () => {
    const result = await analyseConstruct('Color', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });
});
