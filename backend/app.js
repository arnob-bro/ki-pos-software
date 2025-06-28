const { ipcMain } = require("electron");
const path = require("path");
const Database = require('better-sqlite3');

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'pos.db'));

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000'); // 10MB cache
db.pragma('temp_store = MEMORY');

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
    userId STRING PRIMARY KEY,
    password STRING NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
  CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
  CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(DATE(created_at));
`);

// Register IPC handlers
require('./ipcHandlers/products')(ipcMain, db);
require('./ipcHandlers/sales')(ipcMain, db);

module.exports = { db }; 