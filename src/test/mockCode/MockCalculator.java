// MockCalculator.java - a small calculator application used as shared
// sample code across category tests

public class MockCalculator {
    public static void main(String[] args) {
        java.util.Map<String, Operation> operations = new java.util.HashMap<>();
        operations.put("add", new AdditionOperation());
        operations.put("subtract", new SubtractionOperation());

        CalculatorEngine engine = new CalculatorEngine(
            operations,
            new ExpressionParser(),
            new DecimalHistoryStore(),
            new CalculationLogger()
        );
        System.out.println(engine.evaluate("2 add 2"));

        PrecisionMath math = new ApacheMathAdapter(new ApacheCommonsMath());
        System.out.println("Sqrt: " + math.sqrt(16));

        CurrencyConverter converter = new ExchangeRateGateway(new ExchangeRateClient());
        System.out.println("10 USD in EUR: " + converter.convert(10, "USD", "EUR"));

        Calculation tip = new TipCalculation();
        System.out.println("Tip: " + tip.calculate(50, 18));
    }
}

// -- Operations: pluggable single-method strategies, no fields --

// ABSTRACTION (pos): interface + implementation separation - single-method interface, no fields
interface Operation {
    double apply(double a, double b);
}

class AdditionOperation implements Operation {
    public double apply(double a, double b) { return a + b; }
}

class SubtractionOperation implements Operation {
    public double apply(double a, double b) { return a - b; }
}

// ABSTRACTION (neg): interface + implementation separation — concrete only, no interface
class QuickAdd {
    public double add(double a, double b) { return a + b; }
}

// -- Persistence: a domain-level history port and two implementations --

interface HistoryRepository {
    void save(String expression, double result);
}

// ABSTRACTION (pos): interface + implementation separation — implements a port declared in a different package
class DecimalHistoryStore implements com.example.calculator.persistence.HistoryPort {
    public void save(String expression, double result) {
        // persistence elided
    }
}

// ABSTRACTION (neg): interface + implementation separation - implements in-file HistoryRepository directly
class InMemoryHistoryStore implements HistoryRepository {
    private final java.util.List<String> entries = new java.util.ArrayList<>();
    public void save(String expression, double result) {
        entries.add(expression + " = " + result);
    }
}

// -- Math utilities: third-party libraries wrapped behind calculator-facing interfaces --

class ApacheCommonsMath {
    double squareRoot(double value) { return Math.sqrt(value); }
}

interface PrecisionMath {
    double sqrt(double value);
}

// ABSTRACTION (pos): adapter/wrapper — Adapter suffix
class ApacheMathAdapter implements PrecisionMath {
    private final ApacheCommonsMath library;
    ApacheMathAdapter(ApacheCommonsMath library) { this.library = library; }
    public double sqrt(double value) { return library.squareRoot(value); }
}

class ExchangeRateClient {
    double fetchRate(String from, String to) { return 1.0; }
}

interface CurrencyConverter {
    double convert(double amount, String from, String to);
}

// ABSTRACTION (pos): adapter/wrapper — Gateway suffix
class ExchangeRateGateway implements CurrencyConverter {
    private final ExchangeRateClient client;
    ExchangeRateGateway(ExchangeRateClient client) { this.client = client; }
    public double convert(double amount, String from, String to) {
        return amount * client.fetchRate(from, to);
    }
}

// ABSTRACTION (neg): adapter/wrapper — Wrapper suffix
class ResultWrapper {
    private double value;
    public double getValue() { return value; }
    public void setValue(double v) { value = v; }
}

// -- Engine: orchestrates operations/history/logging behind one entry
//    point, wired through its constructor --

class CalculationLogger {
    void log(String message) { System.out.println(message); }
}

class ExpressionParser {
    String[] parse(String expression) { return expression.split(" "); }
}

// ABSTRACTION (pos): constructor injection - final fields assigned in constructor, @Autowired on the constructor itself.
// ABSTRACTION (pos): facade - orchestrates parser/operations/history/logger collaborators behind evaluate()/register()
class CalculatorEngine {
    private final java.util.Map<String, Operation> operations;
    private final ExpressionParser parser;
    private final HistoryRepository history;
    private final CalculationLogger logger;

    @org.springframework.beans.factory.annotation.Autowired
    CalculatorEngine(java.util.Map<String, Operation> operations, ExpressionParser parser,
                      HistoryRepository history, CalculationLogger logger) {
        this.operations = operations;
        this.parser = parser;
        this.history = history;
        this.logger = logger;
    }

    double evaluate(String expression) {
        String[] tokens = parser.parse(expression);
        Operation op = operations.get(tokens[1]);
        double result = op.apply(Double.parseDouble(tokens[0]), Double.parseDouble(tokens[2]));
        history.save(expression, result);
        logger.log(expression + " = " + result);
        return result;
    }

    void register(String name, Operation operation) {
        operations.put(name, operation);
    }
}

// ABSTRACTION (neg): constructor injection - field-level @Autowired, no constructor wiring
class LegacyCalculatorEngine {
    @org.springframework.beans.factory.annotation.Autowired
    private CalculationLogger logger;

    double evaluate(double a, double b) {
        double result = a + b;
        logger.log("legacy add -> " + result);
        return result;
    }
}

// ABSTRACTION (neg): facade - plain data holder, no subsystem
class SessionFacade {
    private String sessionId;
    private String userId;
    public String getSessionId() { return sessionId; }
    public void setSessionId(String v) { sessionId = v; }
    public String getUserId() { return userId; }
    public void setUserId(String v) { userId = v; }
}

interface Display {
    void render(String text);
}

// ABSTRACTION (neg): facade - Service suffix, not simplifying a subsystem the way CalculatorEngine does
class DisplayService {
    private final Display display;
    DisplayService(Display display) { this.display = display; }
    void show(String text) { display.render(text); }
}

// -- Calculation modes: a shared algorithm skeleton, filled in per mode --

// ABSTRACTION (pos): template method — abstract class defines algorithm; concrete subclasses fill in abstract steps
abstract class Calculation {
    final double calculate(double base, double input) {
        validate(input);
        return format(compute(base, input));
    }
    abstract void validate(double input);
    abstract double compute(double base, double input);
    abstract double format(double result);
}

class PercentageCalculation extends Calculation {
    void validate(double input) {
        if (input < 0 || input > 100) throw new IllegalArgumentException("percentage out of range");
    }
    double compute(double base, double input) { return base * (input / 100.0); }
    double format(double result) { return Math.round(result * 100.0) / 100.0; }
}

class TipCalculation extends Calculation {
    void validate(double input) {
        if (input < 0) throw new IllegalArgumentException("tip percent cannot be negative");
    }
    double compute(double base, double input) { return base * (1 + input / 100.0); }
    double format(double result) { return Math.round(result * 100.0) / 100.0; }
}

// ABSTRACTION (neg): template method - concrete class, no abstract methods, no subclasses
class FlatFeeCalculation {
    double calculate(double base, double fee) { return base + fee; }
}
