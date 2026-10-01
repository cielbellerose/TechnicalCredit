import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Builder — Negative Tests
 *
 * Looking for: a class whose setter-style methods return the builder itself
 * so calls can be chained, with a final step that produces the complex object.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Negative.java');

const CATEGORY = 'builder' as HeuristicCategory;

describe('Builder: negative', () => {
  test('User → not TC (plain setters return void, no chaining)', async () => {
    const result = await analyseConstruct('User', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Coffee → not TC (telescoping constructors, no step-by-step construction)', async () => {
    const result = await analyseConstruct('Coffee', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Calculator → not TC (chained add/multiply operate on a value, no complex object is built)', async () => {
    const result = await analyseConstruct('Calculator', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Point → not TC (single static factory call, no builder steps)', async () => {
    const result = await analyseConstruct('Point', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('Money → not TC (withX() methods return new immutable copies, not a mutable builder)', async () => {
    const result = await analyseConstruct('Money', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });
});
