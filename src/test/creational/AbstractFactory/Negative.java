// factory-shaped class with a create method, but it directly news one concrete, unrelated type - no top-level factory interface, no shared product interface
class ConnectionFactory {
    public DatabaseConnection createConnection(String url) {
        return new DatabaseConnection(url);
    }
}

class DatabaseConnection {
    private final String url;

    DatabaseConnection(String url) {
        this.url = url;
    }

    public void open() {
        System.out.println("Connected to " + url);
    }
}

// multiple create methods, but each returns a different concrete type with no shared interface between them - not a coherent product family, just a grab bag
class ReportBundler {
    public PdfReport createPdfReport(String title) {
        return new PdfReport(title);
    }

    public CsvExport createCsvExport(String title) {
        return new CsvExport(title);
    }
}

class PdfReport {
    private final String title;

    PdfReport(String title) {
        this.title = title;
    }
}

class CsvExport {
    private final String title;

    CsvExport(String title) {
        this.title = title;
    }
}

// plain business logic class that builds its own concrete helper objects inline - no factory interface, no abstract product type, no delegation
class OrderProcessor {
    public double process(String sku, int quantity) {
        PricingTable pricingTable = new PricingTable();
        double unitPrice = pricingTable.lookup(sku);
        return unitPrice * quantity;
    }
}

class PricingTable {
    public double lookup(String sku) {
        return sku.startsWith("PREMIUM") ? 199.99 : 19.99;
    }
}
