import * as fs from 'fs';
import * as path from 'path';

import { analyseSource } from '../../../../support/analyseLive';

/**
 * Creational: Prototype — Negative Tests
 *
 * Signal: an interface/abstract class declares a clone() method returning
 * its own type, and concrete classes implement it to copy an existing
 * instance instead of being built from scratch.
 *
 * Each test sends one construct from the co-located Prototype.java to Claude
 * for a live analysis and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

const SOURCE = fs.readFileSync(path.join(__dirname, 'Prototype.java'), 'utf-8');

describe('Prototype: negative', () => {
  test('ContactCard → not TC (copy constructor + snapshot() returning an unrelated type, no clone() contract)', async () => {
    const result = await analyseSource(
      'ContactCard',
      'abstraction',
      SOURCE,
      'Prototype.java',
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
