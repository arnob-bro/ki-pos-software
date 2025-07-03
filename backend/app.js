const { ipcMain } = require("electron");
const path = require("path");
const fs = require('fs');
const Database = require('better-sqlite3');
const { runMigrations } = require('./migrations/runner');

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'pos.db'));

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000'); // 10MB cache
db.pragma('temp_store = MEMORY');

// Ensure migrations directory exists
const migrationsDir = path.join(__dirname, 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir);
}

// Run migrations
runMigrations(db);

// Register IPC handlers
require('./ipcHandlers/products')(ipcMain, db);
require('./ipcHandlers/transactions')(ipcMain, db);

module.exports = { db }; 