import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Factory Method — Positive Tests
 *
 * Looking for: an abstract creator class with an abstract factory method,
 * extended by concrete creators that decide which product to instantiate,
 * while the creator's own logic only refers to the abstract product.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Positive.java');

const CATEGORY = 'factory-method' as HeuristicCategory;

describe('Factory Method: positive', () => {
  test('DocumentCreator → TC (abstract creator with abstract createDocument(), subclassed by concrete creators)', async () => {
    const result = await analyseConstruct(
      'DocumentCreator',
      CATEGORY,
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('factory-method');
  });

  test('Dialog → TC (render() only uses the abstract Button returned by createButton())', async () => {
    const result = await analyseConstruct('Dialog', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('factory-method');
  });

  test('LoggerProvider → TC (parameterised abstract createLogger(name), cached by the base class)', async () => {
    const result = await analyseConstruct(
      'LoggerProvider',
      CATEGORY,
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('factory-method');
  });
});
