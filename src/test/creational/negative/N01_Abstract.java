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
