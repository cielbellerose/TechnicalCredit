class Receipt {
    private final String id;
    Receipt(String id) { this.id = id; }
    String getId() { return id; }
}

// static factory with a private constructor, but every call returns a new instance
class ReceiptFactory {
    private ReceiptFactory() {}

    public static Receipt newReceipt(String id) {
        return new Receipt(id);
    }
}

// private constructor + getInstance() name, but it builds a fresh object each call
class Session {
    private final long createdAt;

    private Session() { this.createdAt = System.currentTimeMillis(); }

    public static Session getInstance() {
        return new Session();
    }
}

// static utility class: private constructor only blocks instantiation, no instance exists
class StringUtils {
    private StringUtils() {}

    public static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}

// static field holds an instance, but the public constructor lets callers create many
class Counter {
    private static Counter last;
    private int value;

    public Counter() { last = this; }

    public static Counter lastCreated() { return last; }
    public void increment() { value++; }
}

// plain enum of constants with no state: not a data-holding singleton
enum Color {
    RED, GREEN, BLUE
}
