// plain setters returning void: no chaining, callers must use one statement per call
class User {
    private String name;
    private String email;
    private int age;

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setAge(int age) { this.age = age; }
}

// telescoping constructors: all configuration is passed up front, no step-by-step assembly
class Coffee {
    private final String size;
    private final boolean milk;
    private final boolean sugar;

    public Coffee(String size) { this(size, false, false); }
    public Coffee(String size, boolean milk) { this(size, milk, false); }
    public Coffee(String size, boolean milk, boolean sugar) {
        this.size = size;
        this.milk = milk;
        this.sugar = sugar;
    }
}

// methods return this, but they are operations on a value, not construction of a complex object
class Calculator {
    private double total;

    public Calculator add(double x) { total += x; return this; }
    public Calculator multiply(double x) { total *= x; return this; }
    public double result() { return total; }
}

// static factory with a single call: no builder steps, no chaining
class Point {
    final int x;
    final int y;

    private Point(int x, int y) { this.x = x; this.y = y; }

    public static Point of(int x, int y) { return new Point(x, y); }
}

// immutable "wither" copies return a new instance of the same type for each change
class Money {
    private final long cents;
    private final String currency;

    Money(long cents, String currency) { this.cents = cents; this.currency = currency; }

    public Money withCents(long cents) { return new Money(cents, currency); }
    public Money withCurrency(String currency) { return new Money(cents, currency); }
}
