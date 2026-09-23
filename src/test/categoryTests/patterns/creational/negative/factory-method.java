// factory-method.java - Factory Method negative case

class PdfDocument {
    public String render(String title) { return "%PDF " + title; }
}

// FACTORY METHOD (neg): concrete class directly news a concrete product — no abstract creator, no subclassing
class ReportPrinter {
    public String print(String title) {
        PdfDocument document = new PdfDocument();
        return "Printed: " + document.render(title);
    }
}
