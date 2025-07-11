const { ipcMain } = require("electron");
const { shell } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { runMigrations } = require("./migrations/runner");
const { hashPassword } = require("./utils/hash");

// Initialize SQLite database
const dbPath = path.join(__dirname, "pos.db");
console.log('Initializing database at:', dbPath);
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = 10000"); // 10MB cache
db.pragma("temp_store = MEMORY");
console.log('Database initialized successfully');

// Ensure migrations directory exists
const migrationsDir = path.join(__dirname, "migrations");
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir);
}

// Run migrations
console.log("Starting database migrations...");
runMigrations(db);
console.log("Database migrations completed");

// Update seed users with proper password hashes
const updateUserPassword = db.prepare(
  "UPDATE users SET password_hash = ? WHERE name = ?"
);

// Update existing seed users with proper password hashes
updateUserPassword.run(hashPassword("admin123"), "Admin User");
updateUserPassword.run(hashPassword("manager123"), "Manager User");
updateUserPassword.run(hashPassword("cashier123"), "Cashier User");

console.log("Seed users updated with proper password hashes.");

// Register IPC handlers
console.log("Registering IPC handlers...");
require("./ipcHandlers/products")(ipcMain, db);
require("./ipcHandlers/transactions")(ipcMain, db);
require("./ipcHandlers/employee")(ipcMain, db);
require("./ipcHandlers/auth")(ipcMain, db);
require("./ipcHandlers/report")(ipcMain, db); // ← Add report IPC handler
// IPC handler to open a file using shell.openPath
ipcMain.handle('open-file', async (event, filePath) => {
  return await shell.openPath(filePath);
});
console.log('IPC handlers registered successfully');

module.exports = { db };
