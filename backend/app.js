const { ipcMain } = require("electron");
const path = require("path");
const Database = require('better-sqlite3');

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'pos.db'));

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
`);

// Register IPC handlers
require('./ipcHandlers/products')(ipcMain, db);
require('./ipcHandlers/sales')(ipcMain, db);

module.exports = { db }; 