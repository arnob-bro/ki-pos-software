const fs = require("fs");
const path = require("path");

function runMigrations(db) {
	// Force clean recreation by dropping all tables and recreating migrations table
	console.log("Starting database migrations...");
	console.log("Database file path:", db.name);
	console.log("Dropping all existing tables for clean migration...");

	// Disable foreign key constraints temporarily
	db.exec(`PRAGMA foreign_keys = OFF`);

	// Drop tables in order (child tables first, then parent tables)
	db.exec(`DROP TABLE IF EXISTS login_attempts`);
	db.exec(`DROP TABLE IF EXISTS data_deletion_logs`);
	db.exec(`DROP TABLE IF EXISTS audit_logs`);
	db.exec(`DROP TABLE IF EXISTS generated_reports`);
	db.exec(`DROP TABLE IF EXISTS transaction_items`);
	db.exec(`DROP TABLE IF EXISTS tse_logs`);
	db.exec(`DROP TABLE IF EXISTS transactions`);
	db.exec(`DROP TABLE IF EXISTS shifts`);
	db.exec(`DROP TABLE IF EXISTS vouchers`);
	db.exec(`DROP TABLE IF EXISTS products`);
	db.exec(`DROP TABLE IF EXISTS customers`);
	db.exec(`DROP TABLE IF EXISTS users`);
	db.exec(`DROP TABLE IF EXISTS categories`);
	db.exec(`DROP TABLE IF EXISTS role_permissions`);
	db.exec(`DROP TABLE IF EXISTS permissions`);
	db.exec(`DROP TABLE IF EXISTS roles`);
	db.exec(`DROP TABLE IF EXISTS migrations`);

	// Re-enable foreign key constraints
	db.exec(`PRAGMA foreign_keys = ON`);

	db.exec(`
    CREATE TABLE migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

	const migrationsDir = path.join(__dirname);
	const files = fs
		.readdirSync(migrationsDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	for (const file of files) {
		try {
			console.log(`Applying migration: ${file}`);
			const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
			db.exec(sql);
			db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
			console.log(`Successfully applied migration: ${file}`);
		} catch (error) {
			console.error(`Error applying migration ${file}:`, error.message);
			throw error;
		}
	}
	console.log("All migrations completed successfully");
}

module.exports = { runMigrations };
