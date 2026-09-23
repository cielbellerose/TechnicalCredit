import * as path from 'path';

import { analyseConstruct } from '@/test/support/analyseLive';

/**
 * Creational: Prototype — Negative Tests
 *
 * Signal: an interface/abstract class declares a clone() method returning
 * its own type, and concrete classes implement it to copy an existing
 * instance instead of being built from scratch.
 *
 * Each test sends one Prototype.java construct to Claude for a live
 * analysis and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
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
});
