import { analyseSource } from '../../../../support/analyseLive';

/**
 * Creational: Prototype — Negative Tests
 *
 * Signal: an interface/abstract class declares a clone() method returning
 * its own type, and concrete classes implement it to copy an existing
 * instance instead of being built from scratch.
 *
 * Each test sends one inline Java construct to Claude for a live analysis
 * and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

const SOURCE = `
// PROTOTYPE (neg): copy constructor plus a "copy"-style method that returns an unrelated type - no shared clone() contract with any interface/abstract class
class ContactCard {
    private final String name;
    private final String phone;

    ContactCard(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    ContactCard(ContactCard other) {
        this.name = other.name;
        this.phone = other.phone;
    }

    ContactCardSnapshot snapshot() {
        return new ContactCardSnapshot(this.name, this.phone);
    }
}

class ContactCardSnapshot {
    private final String name;
    private final String phone;

    ContactCardSnapshot(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }
}
`;

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
