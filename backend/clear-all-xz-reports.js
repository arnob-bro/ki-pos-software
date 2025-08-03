const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "pos.db");
const db = new Database(dbPath);

console.log("🗑️  Removing all X and Z reports...");

try {
	const result = db
		.prepare(
			"DELETE FROM generated_reports WHERE type IN ('x_report', 'z_report')"
		)
		.run();
	console.log(`✅ Removed ${result.changes} X/Z reports`);
} catch (error) {
	console.error("❌ Error:", error.message);
} finally {
	db.close();
	console.log("Done.");
}
