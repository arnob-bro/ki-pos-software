const { ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const { hashPassword } = require("./utils/hash");

// Initialize SQLite database
const db = new Database(path.join(__dirname, "pos.db"));

// Enable WAL mode for better concurrent performance
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = 10000"); // 10MB cache
db.pragma("temp_store = MEMORY");

// Create necessary tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT NOT NULL, -- JSON string of items
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'manager')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
  CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(DATE(created_at));
`);

// Seed default users if not already present
const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (checkUser.count === 0) {
  const insert = db.prepare(
    'INSERT INTO users (user_id, password, role) VALUES (?, ?, ?)'
  );

  insert.run('admin001', hashPassword('admin123'), 'admin');
  insert.run('cashier001', hashPassword('cashier123'), 'cashier');
  insert.run('manager001', hashPassword('manager123'), 'manager');

  console.log("Seed users added.");
}

// Register IPC handlers
require("./ipcHandlers/products")(ipcMain, db);
require("./ipcHandlers/sales")(ipcMain, db);
require("./ipcHandlers/auth")(ipcMain, db); // ← Add auth IPC handler

module.exports = { db };
