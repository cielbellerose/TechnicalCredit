import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';

/**
 * Creational: Abstract Factory — Positive Tests
 *
 * Looking for: a top-level interface declaring one creation method per member
 * of a product family, implemented by concrete factories, alongside abstract
 * product interfaces implemented by the concrete products those factories return.
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'Positive.java');

describe('Abstract Factory: positive', () => {
  test('GUIFactory → TC (top-level factory interface implemented by WinFactory/MacFactory, each producing a matched product family)', async () => {
    const result = await analyseConstruct(
      'GUIFactory',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  test('Button → TC (abstract product interface implemented by WinButton/MacButton, one per concrete factory)', async () => {
    const result = await analyseConstruct('Button', 'abstraction', MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });
});
