import { analyseSource } from '../../../../support/analyseLive';

/**
 * Creational: Prototype — Positive Tests
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
// PROTOTYPE (pos): interface declares clone() returning its own type; Circle implements it to copy itself instead of being rebuilt from scratch
interface Shape {
    Shape clone();
    void draw();
}

class Circle implements Shape {
    private final int radius;

    Circle(int radius) {
        this.radius = radius;
    }

    public Circle clone() {
        return new Circle(this.radius);
    }

    public void draw() {
        System.out.println("Circle r=" + radius);
    }
}
`;

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
