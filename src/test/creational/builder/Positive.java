// classic fluent builder: nested static Builder with self-returning setters and build()
class Pizza {
    private final String size;
    private final boolean cheese;
    private final boolean pepperoni;

    private Pizza(Builder builder) {
        this.size = builder.size;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
    }

    public static class Builder {
        private String size = "medium";
        private boolean cheese;
        private boolean pepperoni;

        public Builder size(String size) { this.size = size; return this; }
        public Builder cheese(boolean cheese) { this.cheese = cheese; return this; }
        public Builder pepperoni(boolean pepperoni) { this.pepperoni = pepperoni; return this; }
        public Pizza build() { return new Pizza(this); }
    }
}

// the caller stacks chained calls to assemble the object step by step
class PizzaShop {
    public Pizza order() {
        return new Pizza.Builder()
            .size("large")
            .cheese(true)
            .pepperoni(true)
            .build();
    }
}

// standalone builder class, separate from the product it assembles
class HttpRequest {
    final String url;
    final String method;
    final java.util.Map<String, String> headers;

    HttpRequest(String url, String method, java.util.Map<String, String> headers) {
        this.url = url;
        this.method = method;
        this.headers = headers;
    }
}

class HttpRequestBuilder {
    private String url;
    private String method = "GET";
    private final java.util.Map<String, String> headers = new java.util.HashMap<>();

    public HttpRequestBuilder url(String url) { this.url = url; return this; }
    public HttpRequestBuilder method(String method) { this.method = method; return this; }
    public HttpRequestBuilder header(String name, String value) {
        headers.put(name, value);
        return this;
    }
    public HttpRequest build() { return new HttpRequest(url, method, headers); }
}

// self-returning "with" steps that accumulate parts of a complex object
class ReportBuilder {
    private final StringBuilder body = new StringBuilder();

    public ReportBuilder addTitle(String title) { body.append("# ").append(title).append("\n"); return this; }
    public ReportBuilder addSection(String text) { body.append(text).append("\n"); return this; }
    public ReportBuilder addFooter(String text) { body.append("--\n").append(text); return this; }
    public String build() { return body.toString(); }
}
