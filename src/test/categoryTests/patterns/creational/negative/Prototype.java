// PROTOTYPE (neg): copy constructor plus a "copy"-style method that returns an unrelated type - no shared clone() contract with any interface/abstract class
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
