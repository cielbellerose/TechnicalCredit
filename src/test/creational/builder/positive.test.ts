import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Builder — Positive Tests
 *
 * Looking for: a class whose setter-style methods return the builder itself
 * so calls can be chained, with a final step that produces the complex object.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Positive.java');

const CATEGORY = 'builder' as HeuristicCategory;

describe('Builder: positive', () => {
  test('Pizza → TC (nested static Builder with self-returning setters and build())', async () => {
    const result = await analyseConstruct('Pizza', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('builder');
  });

  test('PizzaShop → TC (caller stacks .size().cheese().pepperoni().build() on the builder)', async () => {
    const result = await analyseConstruct('PizzaShop', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('builder');
  });

  test('HttpRequestBuilder → TC (standalone builder class with chained url/method/header steps)', async () => {
    const result = await analyseConstruct(
      'HttpRequestBuilder',
      CATEGORY,
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('builder');
  });

  test('ReportBuilder → TC (self-returning addTitle/addSection/addFooter steps accumulate a report)', async () => {
    const result = await analyseConstruct('ReportBuilder', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('builder');
  });
});
