import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';
import type { HeuristicCategory } from '@/prompts/heuristics';

/**
 * Creational: Singleton — Positive Tests
 *
 * Looking for: a class (or enum) that guarantees a single instance and
 * exposes it through a global access point — double-checked locking,
 * Bill Pugh holder, or a data-holding enum.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Positive.java');

const CATEGORY = 'singleton' as HeuristicCategory;

describe('Singleton: positive', () => {
  test('ConfigManager → TC (static volatile instance, getInstance() uses double-checked locking)', async () => {
    const result = await analyseConstruct('ConfigManager', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('singleton');
  });

  test('ConnectionPool → TC (Bill Pugh: static inner Holder lazily creates the single instance)', async () => {
    const result = await analyseConstruct(
      'ConnectionPool',
      CATEGORY,
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('singleton');
  });

  test('AppSettings → TC (enum with a single INSTANCE constant that stores data)', async () => {
    const result = await analyseConstruct('AppSettings', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('singleton');
  });

  test('AuditLog → TC (private constructor, final static INSTANCE, global getInstance())', async () => {
    const result = await analyseConstruct('AuditLog', CATEGORY, MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('singleton');
  });
});
