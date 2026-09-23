class PdfDocument {
    public String render(String title) { return "%PDF " + title; }
}

// concrete class directly news a concrete product — no abstract creator, no subclassing
class ReportPrinter {
    public String print(String title) {
        PdfDocument document = new PdfDocument();
        return "Printed: " + document.render(title);
    }
}

class Invoice {
    private final double amount;
    Invoice(double amount) { this.amount = amount; }
    double getAmount() { return amount; }
}

// createInvoice() is named like a factory method, but it's concrete and nothing overrides it
class InvoiceService {
    public Invoice createInvoice(double amount) {
        return new Invoice(amount);
    }

    public double total(java.util.List<Double> amounts) {
        double sum = 0;
        for (double amount : amounts) {
            sum += createInvoice(amount).getAmount();
        }
        return sum;
    }
}

class Circle {
    double area(double r) { return Math.PI * r * r; }
}

class Square {
    double area(double s) { return s * s; }
}

// static "simple factory" — a switch over concrete types, no abstract creator for subclasses to extend
class ShapeFactory {
    public static Object create(String type) {
        switch (type) {
            case "circle": return new Circle();
            case "square": return new Square();
            default: throw new IllegalArgumentException(type);
        }
    }
}
