interface Document {
    String render(String title);
}

class PdfDocument implements Document {
    public String render(String title) { return "%PDF " + title; }
}

class HtmlDocument implements Document {
    public String render(String title) { return "<h1>" + title + "</h1>"; }
}

// abstract creator declares the factory method; subclasses decide which Document to instantiate
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

interface Button {
    String draw();
}

class WindowsButton implements Button {
    public String draw() { return "[Windows button]"; }
}

class WebButton implements Button {
    public String draw() { return "<button/>"; }
}

// the creator's business logic only ever sees the abstract Button returned by the factory method
abstract class Dialog {
    protected abstract Button createButton();

    public String render(String message) {
        Button ok = createButton();
        return message + "\n" + ok.draw();
    }
}

class WindowsDialog extends Dialog {
    protected Button createButton() { return new WindowsButton(); }
}

class WebDialog extends Dialog {
    protected Button createButton() { return new WebButton(); }
}

interface Logger {
    void log(String message);
}

class ConsoleLogger implements Logger {
    private final String name;
    ConsoleLogger(String name) { this.name = name; }
    public void log(String message) { System.out.println(name + ": " + message); }
}

class FileLogger implements Logger {
    private final String name;
    FileLogger(String name) { this.name = name; }
    public void log(String message) { /* append to name + ".log" */ }
}

// parameterised factory method; the base class caches whatever the subclass creates
abstract class LoggerProvider {
    private final java.util.Map<String, Logger> cache = new java.util.HashMap<>();

    protected abstract Logger createLogger(String name);

    public Logger getLogger(String name) {
        return cache.computeIfAbsent(name, this::createLogger);
    }
}

class ConsoleLoggerProvider extends LoggerProvider {
    protected Logger createLogger(String name) { return new ConsoleLogger(name); }
}

class FileLoggerProvider extends LoggerProvider {
    protected Logger createLogger(String name) { return new FileLogger(name); }
}
