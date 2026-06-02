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

// --- H4 positive cases: class name suffix matches the TC pattern list
// (Adapter|Repository|Gateway|Port|Service|Strategy|Factory|Builder|Policy)
// AND the construct is a meaningful abstraction (abstraction / reusability) ---

// Gateway: adapts an external payment provider behind a domain interface.
interface PaymentGateway {
    boolean charge(String token, long amountCents);
}

class StripeGateway implements PaymentGateway {
    private final StripeClient client;

    StripeGateway(StripeClient client) {
        this.client = client;
    }

    @Override
    public boolean charge(String token, long amountCents) {
        return client.createCharge(token, amountCents).isPaid();
    }
}

// Factory: centralises construction of Order aggregates behind named methods.
class OrderFactory {
    static Order newDraft(String customerId) {
        return new Order(customerId, "DRAFT");
    }

    static Order fromCart(Cart cart) {
        return new Order(cart.customerId(), "PENDING");
    }
}

// Strategy: pluggable pricing algorithm, selected at runtime.
interface PricingStrategy {
    long priceFor(Order order);
}

// Builder: fluent, immutable construction of an HttpClient.
class HttpClientBuilder {
    private int timeoutMs = 30_000;
    private boolean followRedirects = true;

    HttpClientBuilder timeoutMs(int value) {
        this.timeoutMs = value;
        return this;
    }

    HttpClientBuilder followRedirects(boolean value) {
        this.followRedirects = value;
        return this;
    }

    HttpClient build() {
        return new HttpClient(timeoutMs, followRedirects);
    }
}

// --- H4 negative cases ---

// Suffix MATCHES the pattern (…Service) but this is a plain data holder:
// no behaviour, no collaborators, no abstraction. H4's recall flags the
// name; precision should reject it. The key false-positive guard.
class AccountService {
    private String accountId;
    private String ownerName;
    private long balanceCents;

    public String getAccountId() { return accountId; }
    public void setAccountId(String v) { this.accountId = v; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String v) { this.ownerName = v; }

    public long getBalanceCents() { return balanceCents; }
    public void setBalanceCents(long v) { this.balanceCents = v; }
}

// No suffix match (Utils is not in the pattern list) and a trivial,
// stateless helper — outside H4's scope entirely.
class StringUtils {
    static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
