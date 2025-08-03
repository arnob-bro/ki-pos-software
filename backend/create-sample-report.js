const Database = require("better-sqlite3");
const path = require("path");

async function createSampleReport() {
	console.log("Creating Sample Report...");

	const dbPath = path.join(__dirname, "pos.db");
	console.log("Database path:", dbPath);

	const db = new Database(dbPath);

	try {
		// Check if generated_reports table exists
		const tableCheck = db
			.prepare(
				`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='generated_reports'
    `
			)
			.get();

		if (!tableCheck) {
			console.log("❌ generated_reports table does not exist! Creating it...");

			// Create the table
			db.prepare(
				`
        CREATE TABLE generated_reports (
          id TEXT PRIMARY KEY,
          type VARCHAR NOT NULL CHECK (type IN ('x_report', 'z_report', 'daily', 'monthly', 'tax', 'employee')),
          generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          data_blob TEXT,
          user_id TEXT
        )
      `
			).run();

			console.log("✅ generated_reports table created");
		}

		// Create a sample X report
		const sampleXReport = {
			type: "X",
			date: "2024-01-15",
			generated_by: "test-user",
			generated_at: new Date().toISOString(),
			summary: {
				total_transactions: 25,
				total_sales: 1250.75,
				cash_sales: 450.25,
				card_sales: 750.5,
				other_sales: 50.0,
			},
			top_products: [
				{ name: "Coffee", qty: 15 },
				{ name: "Sandwich", qty: 8 },
				{ name: "Cake", qty: 5 },
				{ name: "Tea", qty: 3 },
				{ name: "Cookie", qty: 2 },
			],
		};

		// Insert the sample report
		const insertStmt = db.prepare(`
      INSERT INTO generated_reports (id, type, user_id, data_blob)
      VALUES (?, ?, ?, ?)
    `);

		const reportId = "sample-x-report-2024-01-15";
		insertStmt.run(
			reportId,
			"x_report",
			"test-user",
			JSON.stringify(sampleXReport)
		);

		console.log("✅ Sample X report created with ID:", reportId);

		// Create a sample Z report
		const sampleZReport = {
			type: "Z",
			date: "2024-01-15",
			generated_by: "test-user",
			generated_at: new Date().toISOString(),
			summary: {
				total_transactions: 25,
				total_sales: 1250.75,
				cash_sales: 450.25,
				card_sales: 750.5,
				other_sales: 50.0,
				total_net: 1051.05,
				total_vat: 199.7,
				total_gross: 1250.75,
			},
			top_products: [
				{ name: "Coffee", qty: 15 },
				{ name: "Sandwich", qty: 8 },
				{ name: "Cake", qty: 5 },
			],
			transactions: [
				{
					id: "TXN-001",
					total: 45.5,
					payment_method: "card",
					created_at: "2024-01-15T09:30:00Z",
				},
				{
					id: "TXN-002",
					total: 32.75,
					payment_method: "cash",
					created_at: "2024-01-15T10:15:00Z",
				},
				{
					id: "TXN-003",
					total: 28.9,
					payment_method: "card",
					created_at: "2024-01-15T11:45:00Z",
				},
			],
		};

		const zReportId = "sample-z-report-2024-01-15";
		insertStmt.run(
			zReportId,
			"z_report",
			"test-user",
			JSON.stringify(sampleZReport)
		);

		console.log("✅ Sample Z report created with ID:", zReportId);

		// Verify the reports were created
		const reports = db
			.prepare("SELECT id, type, generated_at FROM generated_reports")
			.all();
		console.log("\n📊 Reports in database:");
		reports.forEach((report) => {
			console.log(`- ${report.id} (${report.type}) - ${report.generated_at}`);
		});

		console.log("\n✅ Sample reports created successfully!");
		console.log(
			"You can now test the download functionality in the application."
		);
	} catch (error) {
		console.error("❌ Failed to create sample report:", error.message);
		console.error("Error stack:", error.stack);
	} finally {
		db.close();
	}
}

createSampleReport();
