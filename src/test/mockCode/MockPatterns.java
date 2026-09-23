// MockPatterns.java - sample constructs for the Gang of Four design pattern
// category tests, grouped by pattern

public class MockPatterns {
    public static void main(String[] args) {
        DocumentCreator creator = new PdfDocumentCreator();
        System.out.println(creator.publish("Quarterly Report"));

        ReportPrinter printer = new ReportPrinter();
        System.out.println(printer.print("Quarterly Report"));
    }
}

// ==================== Creational: Factory Method ====================

interface Document {
    String render(String title);
}

class PdfDocument implements Document {
    public String render(String title) { return "%PDF " + title; }
}

class HtmlDocument implements Document {
    public String render(String title) { return "<h1>" + title + "</h1>"; }
}

// FACTORY METHOD (pos): abstract creator declares the factory method; subclasses decide which Document to instantiate
abstract class DocumentCreator {
    protected abstract Document createDocument();

    public String publish(String title) {
        Document document = createDocument();
        String rendered = document.render(title);
        return "Published: " + rendered;
    }
}

class PdfDocumentCreator extends DocumentCreator {
    protected Document createDocument() { return new PdfDocument(); }
}

class HtmlDocumentCreator extends DocumentCreator {
    protected Document createDocument() { return new HtmlDocument(); }
}

// FACTORY METHOD (neg): concrete class directly news a concrete product — no abstract creator, no subclassing
class ReportPrinter {
    public String print(String title) {
        PdfDocument document = new PdfDocument();
        return "Printed: " + document.render(title);
    }
}
