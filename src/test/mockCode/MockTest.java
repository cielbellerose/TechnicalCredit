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

// --- H3 positive cases: constructor injection (abstraction/configurability) ---
// Final fields set only in the constructor, or @Autowired on the constructor
// (not on fields). The dependency is supplied from outside, so the
// implementation can be substituted — the design anticipated change.

// Plain Java constructor injection: the single dependency is a final field
// assigned only in the constructor. No framework needed for the signal.
class OrderService {
    private final PaymentGateway gateway;

    OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    boolean checkout(long amountCents) {
        return gateway.charge(amountCents);
    }
}

// Spring constructor injection: @Autowired sits on the constructor (not the
// fields), and every collaborator is a final field.
class NotificationService {
    private final EmailClient email;
    private final SmsClient sms;

    @org.springframework.beans.factory.annotation.Autowired
    NotificationService(EmailClient email, SmsClient sms) {
        this.email = email;
        this.sms = sms;
    }

    void notifyUser(String userId, String message) {
        email.send(userId, message);
        sms.send(userId, message);
    }
}

// Plain Java constructor injection with multiple final collaborators, all set
// only in the constructor — clear substitution seam for testing/extension.
class ReportBuilder {
    private final DataSource source;
    private final Formatter formatter;

    ReportBuilder(DataSource source, Formatter formatter) {
        this.source = source;
        this.formatter = formatter;
    }

    String build() {
        return formatter.format(source.read());
    }
}

// --- H3 negative cases: field / setter injection (no constructor seam) ---

// Field-level injection: @Autowired on the fields themselves, which are
// mutable (non-final). There is no constructor seam — H3 requires constructor
// injection, so this must not count.
class UserController {
    @org.springframework.beans.factory.annotation.Autowired
    private UserRepository repository;

    @org.springframework.beans.factory.annotation.Autowired
    private AuditLogger audit;

    String find(String id) {
        return repository.findName(id);
    }
}

// Setter injection: the dependency arrives through a setter after construction,
// so the field cannot be final and the object is mutable. Not the constructor
// injection pattern H3 looks for.
class EmailService {
    private SmtpClient client;

    public void setClient(SmtpClient client) {
        this.client = client;
    }

    void send(String to, String body) {
        client.deliver(to, body);
    }
}
