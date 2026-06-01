// MockTest.java - sample code the test suite reads as fixtures.
//
// Each top-level type here is catalogued in the matching heuristic test
// (e.g. h1.test.ts) with its expected verdict, and that test extracts the
// construct from this file. buildContextCore.test.ts also reads this file.
//
// Grouped by heuristic below; grow this file as new heuristics are added.

public class MockTest {
    public static void main(String[] args) {
        // Exercise the three positive H1 interfaces via lambdas.
        EventListener listener = () -> System.out.println("event fired");
        listener.onEvent();

        Validator validator = input -> input != null && input.contains("@");
        System.out.println("valid? " + validator.validate("a@b.com"));

        Greetable greeter = () -> System.out.println("Hello!");
        greeter.greet();

        // Exercise the negative cases.
        Calculator calc = new Calculator();
        System.out.println("Sum: " + calc.add(5, 3));

        System.out.println("Max retries: " + Constants.MAX_RETRIES);
    }
}

// --- H1 positive cases: interfaces with no fields (abstraction) ---

interface EventListener {
    void onEvent();
}

interface Validator {
    boolean validate(String input);
}

interface Greetable {
    void greet();
}

// --- H1 negative cases ---

class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}

interface Constants {
    int MAX_RETRIES = 3;
    String DEFAULT_CURRENCY = "USD";
}
