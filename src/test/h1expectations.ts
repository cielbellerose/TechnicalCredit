/**
 * Test cases for the H1 detection prompt (interface with no fields →
 * abstraction).
 *
 * Cases simulate the data sent to Claude when `Analyse for TC` is invoked. 
 * 
 * The same constructs also appear together in MockTest.java
 * for anyone who wants the realistic-file view — but THIS file is the
 * authoritative test driver.
 */
export interface H1Case {
  /** Human-friendly identifier; matches a construct in MockTest.java. */
  name: string;
  /** One line explaining why this case is here. Shows up in test names. */
  rationale: string;
  /** The Java source that will be passed to detectH1. */
  code: string;
  /**
   * The minimum we commit to about detectH1's output for `code`.
   * Other fields exist on the response but aren't pinned here while the
   * prompt's output format is still being designed.
   */
  expected: { is_tc_candidate: boolean };
}

export const h1Cases: H1Case[] = [
  // --- Positive cases: interfaces with no fields ---
  {
    name: "EventListener",
    rationale: "Single-method interface, no fields — classic abstraction.",
    code: `interface EventListener {
    void onEvent();
}`,
    expected: { is_tc_candidate: true },
  },
  {
    name: "Validator",
    rationale: "Interface with one method and no fields.",
    code: `interface Validator {
    boolean validate(String input);
}`,
    expected: { is_tc_candidate: true },
  },
  {
    name: "Greetable",
    rationale: "Interface with one void method and no fields.",
    code: `interface Greetable {
    void greet();
}`,
    expected: { is_tc_candidate: true },
  },

  // --- Negative cases: not interfaces, or interfaces with fields ---
  {
    name: "Calculator",
    rationale: "Concrete class — not an interface, so not H1.",
    code: `class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}`,
    expected: { is_tc_candidate: false },
  },
  {
    name: "Constants",
    rationale: "Is an interface, but it has fields — H1 requires no fields.",
    code: `interface Constants {
    int MAX_RETRIES = 3;
    String DEFAULT_CURRENCY = "USD";
}`,
    expected: { is_tc_candidate: false },
  },
];
