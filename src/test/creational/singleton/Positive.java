// double-checked locking: static volatile instance, getInstance() checks before creating
class ConfigManager {
    private static volatile ConfigManager instance;

    private ConfigManager() {}

    public static ConfigManager getInstance() {
        if (instance == null) {
            synchronized (ConfigManager.class) {
                if (instance == null) {
                    instance = new ConfigManager();
                }
            }
        }
        return instance;
    }

    public String get(String key) { return System.getProperty(key); }
}

// Bill Pugh: the static inner holder lazily creates the single instance of the outer class
class ConnectionPool {
    private ConnectionPool() {}

    private static class Holder {
        private static final ConnectionPool INSTANCE = new ConnectionPool();
    }

    public static ConnectionPool getInstance() {
        return Holder.INSTANCE;
    }

    public java.sql.Connection acquire() { return null; }
}

// enum singleton: a single constant that stores data
enum AppSettings {
    INSTANCE;

    private String theme = "light";

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}

// eager initialisation: private constructor, final static instance, global accessor
class AuditLog {
    private static final AuditLog INSTANCE = new AuditLog();
    private final java.util.List<String> entries = new java.util.ArrayList<>();

    private AuditLog() {}

    public static AuditLog getInstance() { return INSTANCE; }

    public void record(String entry) { entries.add(entry); }
}
