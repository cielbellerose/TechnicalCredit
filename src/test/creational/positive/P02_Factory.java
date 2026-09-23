// P02_Factory.java - Factory Method positive case

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
