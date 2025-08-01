const fs = require("fs");
const path = require("path");

/**
 * Export GoBD-compliant data: transactions.csv, transaction_items.csv, metadata.txt
 * @param {Object} summary - Aggregated summary data (for metadata)
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} items - Array of transaction item objects
 * @param {Object} [options] - Optional: { companyInfo, softwareInfo }
 * @returns {Object} Export result
 */
async function exportGoBD(summary, transactions, items, options = {}, db) {
	try {
		// Create exports directory if it doesn't exist
		const exportsDir = path.join(__dirname, "../exports");
		if (!fs.existsSync(exportsDir)) {
			fs.mkdirSync(exportsDir, { recursive: true });
		}
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const baseName = `gobd-export-${timestamp}`;

		// 1. Write transactions.csv
		const txHeaders = [
			"Transaction_ID",
			"Timestamp",
			"User",
			"Payment_Method",
			"Gross_Amount",
			"Net_Amount",
			"VAT_Amount",
			"VAT_Rate",
			"Correction",
			"Cancelled",
			"Customer_ID",
			"Receipt_Number",
		];
		const txRows = [txHeaders.join(",")];
		transactions.forEach((tx) => {
			txRows.push(
				[
					tx.id,
					tx.timestamp,
					tx.user_id || "",
					tx.payment_method,
					tx.total_amount,
					tx.net_amount || "",
					tx.vat_amount,
					tx.vat_rate || "",
					tx.correction_flag || "",
					tx.cancelled_flag || "",
					tx.customer_id || "",
					tx.receipt_number || "",
				].join(",")
			);
		});
		const txFile = path.join(exportsDir, `${baseName}-transactions.csv`);
		fs.writeFileSync(txFile, "\uFEFF" + txRows.join("\n"), {
			encoding: "utf8",
		});

		// 2. Write transaction_items.csv
		const itemHeaders = [
			"Transaction_ID",
			"Item_ID",
			"Product_ID",
			"Product_Name",
			"Category",
			"SKU",
			"Quantity",
			"Unit_Price",
			"VAT_Rate",
			"VAT_Amount",
			"Total_Net",
			"Total_Gross",
		];
		const itemRows = [itemHeaders.join(",")];
		items.forEach((i) => {
			itemRows.push(
				[
					i.transaction_id,
					i.id,
					i.product_id,
					i.product_name || "",
					i.category || "",
					i.sku || "",
					i.quantity,
					i.unit_price,
					i.vat_rate || "",
					i.vat_amount || "",
					(i.unit_price * i.quantity).toFixed(2),
					(i.unit_price * i.quantity + (i.vat_amount || 0)).toFixed(2),
				].join(",")
			);
		});
		const itemFile = path.join(exportsDir, `${baseName}-transaction_items.csv`);
		fs.writeFileSync(itemFile, "\uFEFF" + itemRows.join("\n"), {
			encoding: "utf8",
		});

		// 4. Write users.csv
		const usersFile = path.join(exportsDir, `${baseName}-users.csv`);
		const usersHeaders = [
			"User_ID",
			"Username",
			"Role",
			"Full_Name",
			"Email",
			"Status",
			"Created_At",
		];
		const usersRows = [usersHeaders.join(",")];
		const users = db
			.prepare(
				`
      SELECT u.id as User_ID, u.name as Username, r.name as Role, u.name as Full_Name, u.email as Email, u.status as Status, u.created_at as Created_At
      FROM users u LEFT JOIN roles r ON u.role_id = r.id
    `
			)
			.all();
		users.forEach((u) => {
			usersRows.push(
				[
					u.User_ID,
					u.Username,
					u.Role,
					u.Full_Name,
					u.Email,
					u.Status,
					u.Created_At,
				].join(",")
			);
		});
		fs.writeFileSync(usersFile, "\uFEFF" + usersRows.join("\n"), {
			encoding: "utf8",
		});

		// 5. Write products.csv
		const productsFile = path.join(exportsDir, `${baseName}-products.csv`);
		const productsHeaders = [
			"Product_ID",
			"Product_Name",
			"Category",
			"SKU",
			"Unit_Price",
			"Net_Price",
			"VAT_Rate",
			"Status",
		];
		const productsRows = [productsHeaders.join(",")];
		const products = db
			.prepare(
				`
      SELECT p.id as Product_ID, p.name as Product_Name, c.name as Category, p.barcode as SKU, p.price as Unit_Price, p.price as Net_Price, p.vat_rate as VAT_Rate, 'Active' as Status
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
    `
			)
			.all();
		products.forEach((p) => {
			productsRows.push(
				[
					p.Product_ID,
					p.Product_Name,
					p.Category,
					p.SKU,
					p.Unit_Price,
					p.Net_Price,
					p.VAT_Rate + "%",
					p.Status,
				].join(",")
			);
		});
		fs.writeFileSync(productsFile, "\uFEFF" + productsRows.join("\n"), {
			encoding: "utf8",
		});

		// 6. Write audit_log.csv
		const auditFile = path.join(exportsDir, `${baseName}-audit_log.csv`);
		const auditHeaders = [
			"Log_ID",
			"Timestamp",
			"User_ID",
			"Action_Type",
			"Entity",
			"Entity_ID",
			"Description",
		];
		const auditRows = [auditHeaders.join(",")];
		const audits = db
			.prepare(
				`
      SELECT id as Log_ID, timestamp as Timestamp, user_id as User_ID, action_type as Action_Type, table_name as Entity, record_id as Entity_ID, 
        ('Old: ' || IFNULL(old_data, '') || '; New: ' || IFNULL(new_data, '')) as Description
      FROM audit_logs
    `
			)
			.all();
		audits.forEach((a) => {
			auditRows.push(
				[
					a.Log_ID,
					a.Timestamp,
					a.User_ID,
					a.Action_Type,
					a.Entity,
					a.Entity_ID,
					'"' + a.Description.replace(/"/g, '""') + '"',
				].join(",")
			);
		});
		fs.writeFileSync(auditFile, "\uFEFF" + auditRows.join("\n"), {
			encoding: "utf8",
		});

		// Update metadata.txt (new format)
		const metaFile = path.join(exportsDir, `${baseName}-metadata.txt`);
		const meta = [];
		meta.push("GoBD Export Metadata");
		meta.push("--------------------");
		meta.push(`Export Date       : ${summary.exportSummary.exportDate}`);
		meta.push(`Export Time       : ${summary.exportSummary.exportTime}`);
		meta.push(
			`Export Range      : ${summary.exportSummary.startDate} to ${summary.exportSummary.endDate}`
		);
		meta.push("");
		meta.push("Company Info:");
		meta.push("  Name: [TO BE FILLED]");
		meta.push("  Address: [TO BE FILLED]");
		meta.push("  Tax ID: [TO BE FILLED]");
		meta.push("");
		meta.push("Software Info:");
		meta.push("  Name: [TO BE FILLED]");
		meta.push("  Version: [TO BE FILLED]");
		meta.push("");
		meta.push("Export Methodology:");
		meta.push(
			"  - Exported from POS system in compliance with GoBD (updated 2019)."
		);
		meta.push(
			"  - Includes all finalized transactions and items for the export date range."
		);
		meta.push("  - Cancellations and corrections are included if available.");
		meta.push(
			"  - Data is formatted in CSV and timestamped in ISO 8601 format."
		);
		meta.push(`  - Export generated by user: user-1`);
		meta.push("");
		meta.push("Files Included:");
		meta.push("  - transactions.csv         (Header-level transaction data)");
		meta.push(
			"  - transaction_items.csv    (Line-item breakdown of products sold)"
		);
		meta.push(
			"  - users.csv                (List of system users and their roles)"
		);
		meta.push("  - products.csv             (Master product catalog)");
		meta.push(
			"  - audit_log.csv            (Full audit trail of data actions)"
		);
		meta.push(
			"  - export_summary.txt       (Readable summary of totals and stats)"
		);
		meta.push("  - metadata.txt             (This file)");
		meta.push("");
		meta.push("Summary:");
		meta.push(`  Total Transactions : ${summary.txnStats.totalTxns}`);
		meta.push(
			`  Total Items Sold   : ${summary.productSummary.totalItemsSold}`
		);
		meta.push(
			`  Gross Sales Total  : €${summary.financialSummary.totalGross.toFixed(
				2
			)}`
		);
		meta.push(
			`  VAT Collected      : €${summary.financialSummary.totalVAT.toFixed(2)}`
		);
		meta.push(
			`  Payment Methods    : Cash (${summary.paymentBreakdown.cashTxns}), Card (${summary.paymentBreakdown.cardTxns}), Other (${summary.paymentBreakdown.otherTxns})`
		);
		meta.push("");
		meta.push("System & Compliance Notes:");
		meta.push("  - Audit trail logging: ENABLED");
		meta.push("  - Digital corrections supported: NO");
		meta.push("  - Digital signatures applied: NO");
		meta.push("  - All data retained according to §147 AO (10 years)");
		fs.writeFileSync(metaFile, meta.join("\n"), { encoding: "utf8" });

		return {
			success: true,
			files: [txFile, itemFile, usersFile, productsFile, auditFile, metaFile],
			baseName,
		};
	} catch (error) {
		throw new Error(`GoBD export failed: ${error.message}`);
	}
}

module.exports = {
	exportGoBD,
};
