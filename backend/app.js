const { ipcMain } = require("electron");
const path = require("path");
const fs = require('fs');
const Database = require('better-sqlite3');
const { runMigrations } = require('./migrations/runner');
const { hashPassword } = require("./utils/hash");

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

// Update seed users with proper password hashes
const updateUserPassword = db.prepare(
  'UPDATE users SET password_hash = ? WHERE name = ?'
);

// Update existing seed users with proper password hashes
updateUserPassword.run(hashPassword('admin123'), 'Admin User');
updateUserPassword.run(hashPassword('manager123'), 'Manager User');
updateUserPassword.run(hashPassword('cashier123'), 'Cashier User');

console.log("Seed users updated with proper password hashes.");

// Register IPC handlers
require("./ipcHandlers/products")(ipcMain, db);
require("./ipcHandlers/transactions")(ipcMain, db);
require("./ipcHandlers/auth")(ipcMain, db); // ← Add auth IPC handler

module.exports = { db }; 