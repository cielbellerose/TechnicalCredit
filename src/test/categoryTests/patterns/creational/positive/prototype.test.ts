import * as fs from 'fs';
import * as path from 'path';

import { analyseSource } from '../../../../support/analyseLive';

/**
 * Creational: Prototype — Positive Tests
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

describe('Prototype: positive', () => {
  test('Shape → TC (declares clone() returning its own type, implemented by Circle)', async () => {
    const result = await analyseSource(
      'Shape',
      'abstraction',
      SOURCE,
      'Prototype.java',
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });
});
