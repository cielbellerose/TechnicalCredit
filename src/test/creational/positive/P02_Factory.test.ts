import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';

/**
 * Creational: Factory Method — positive tests. Each test sends one
 * P02_Factory.java construct to Claude for a live analysis.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);
const MOCK_FILE = path.join(__dirname, 'P02_Factory.java');

describe('Factory Method: positive', () => {
  test('DocumentCreator → TC (abstract creator with abstract createDocument(), subclassed by concrete creators)', async () => {
    const result = await analyseConstruct(
      'DocumentCreator',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  test('Dialog → TC (render() only uses the abstract Button returned by createButton())', async () => {
    const result = await analyseConstruct('Dialog', 'abstraction', MOCK_FILE);

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  test('LoggerProvider → TC (parameterised abstract createLogger(name), cached by the base class)', async () => {
    const result = await analyseConstruct(
      'LoggerProvider',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });
});
