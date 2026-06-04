// MockTest.java - sample code the test suite reads.

// This file contains a mix of positive and negative cases for the heuristics.
// Grouped by heuristic below; grow this file as new heuristics are added.

public class MockTest {
    public static void main(String[] args) {
        // Positive H1 interfaces via lambdas: no fields
        EventListener listener = () -> System.out.println("event fired");
        listener.onEvent();

        Validator validator = input -> input != null && input.contains("@");
        System.out.println("valid? " + validator.validate("a@b.com"));

        Greetable greeter = () -> System.out.println("Hello!");
        greeter.greet();

        // Negative H1 cases: concrete class and interface with fields
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

// --- H5 positive: observability via Micrometer / structured logging ---
// (Imports io.micrometer.* or MDC usage in method bodies — near-zero false
// positives.) Signals live inside each construct so the extracted slice the
// user highlights carries the evidence on its own.

// Micrometer: registers and increments a counter against a MeterRegistry.
class OrderMetrics {
    private final io.micrometer.core.instrument.MeterRegistry registry;

    OrderMetrics(io.micrometer.core.instrument.MeterRegistry registry) {
        this.registry = registry;
    }

    void recordPlaced() {
        registry.counter("orders.placed").increment();
    }
}

// Micrometer: @Timed annotation instruments method latency.
class PaymentProcessor {
    @io.micrometer.core.annotation.Timed("payment.process")
    public boolean process(String token, long amountCents) {
        return amountCents > 0;
    }
}

// Structured logging: MDC context + key=value log line (not string concat).
class AuditLogger {
    private final org.slf4j.Logger log =
        org.slf4j.LoggerFactory.getLogger(AuditLogger.class);

    void record(String event, String userId, long amountCents) {
        org.slf4j.MDC.put("userId", userId);
        try {
            log.info("event={} userId={} amount={}", event, userId, amountCents);
        } finally {
            org.slf4j.MDC.clear();
        }
    }
}

// --- H5 negative cases ---

// Logs, but via println string concatenation — no Micrometer, no MDC, no
// structured key=value. The false-positive guard: "it logs" is not enough.
class NaivePrinter {
    void report(String userId) {
        System.out.println("user " + userId + " did something");
    }
}

// Uses a real SLF4J logger, but string concatenation — no MDC, no key={}
// placeholders. The key precision guard: "uses a logger" is not structured
// logging and must not count as observability TC.
class UnstructuredLogger {
    private final org.slf4j.Logger log =
        org.slf4j.LoggerFactory.getLogger(UnstructuredLogger.class);

    void login(String userId) {
        log.info("user " + userId + " logged in at " + System.currentTimeMillis());
    }
}

// The "io.micrometer..." token appears only as a String literal (a class name
// loaded via reflection) and in a comment — never as a real import or call.
// Guards against naive substring / regex matching on the source text.
class ReflectiveLoader {
    // TODO: migrate this to io.micrometer once the registry is wired
    Object load() throws Exception {
        String className = "io.micrometer.core.instrument.MeterRegistry";
        return Class.forName(className);
    }
}