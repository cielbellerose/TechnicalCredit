// copy constructor plus a "copy"-style method that returns an unrelated type - no shared clone() contract with any interface/abstract class
class ContactCard {
    private final String name;
    private final String phone;

    ContactCard(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    ContactCard(ContactCard other) {
        this.name = other.name;
        this.phone = other.phone;
    }

    ContactCardSnapshot snapshot() {
        return new ContactCardSnapshot(this.name, this.phone);
    }
}

class ContactCardSnapshot {
    private final String name;
    private final String phone;

    ContactCardSnapshot(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }
}

// "copy"-style method takes a different shape (extra parameter) instead of a no-arg clone() contract
class Invoice {
    private final double amount;
    private final String currency;

    Invoice(double amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    Invoice copyWith(double amount) {
        return new Invoice(amount, this.currency);
    }
}

// plain data holder with only a private copy constructor - no clone() contract, nothing implements/extends it
class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    private Point(Point other) {
        this.x = other.x;
        this.y = other.y;
    }
}
