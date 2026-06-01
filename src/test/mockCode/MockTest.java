// MockTest.java — TEST-ONLY file with examples for TechnicalCredit detection.
// Each top-level type below is annotated in src/test/expectations.ts with
// its expected H-pattern outcomes.

// Currently this is just an example file for demonstration purposes, as tests currently only use string snippits. 

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

// --- Positive H1 cases: interfaces with no fields (abstraction) ---

interface EventListener {
    void onEvent();
}

interface Validator {
    boolean validate(String input);
}

interface Greetable {
    void greet();
}

// --- Negative H1 cases ---

class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}

interface Constants {
    int MAX_RETRIES = 3;
    String DEFAULT_CURRENCY = "USD";
}
