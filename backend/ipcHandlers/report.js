const ReportService = require("../services/reportService");
const ReportController = require("../controllers/reportController");
const fs = require("fs");
const path = require("path");

module.exports = function registerReportHandlers(ipcMain, db) {
	const reportService = new ReportService(db);
	const reportController = new ReportController(reportService);

	// Generate X Report
	ipcMain.handle("reports:generateX", async (event, date, userId) => {
		try {
			return await reportController.generateXReport(date, userId);
		} catch (error) {
			console.error("Error generating X report:", error.message);
			throw error;
		}
	});

	// Generate Z Report
	ipcMain.handle("reports:generateZ", async (event, date, userId) => {
		try {
			return await reportController.generateZReport(date, userId);
		} catch (error) {
			console.error("Error generating Z report:", error.message);
			throw error;
		}
	});

	// Get all generated reports
	ipcMain.handle(
		"reports:list",
		async (event, userId, page = 1, limit = 20) => {
			try {
				return await reportController.getGeneratedReports(userId, page, limit);
			} catch (error) {
				console.error("Error listing reports:", error.message);
				throw error;
			}
		}
	);

	// Check if Z report exists
	ipcMain.handle("reports:checkZReportExists", async (event, date, userId) => {
		return await reportController.checkZReportExists(date, userId);
	});

	// Export GoBD data
	ipcMain.handle("reports:exportGoBD", async (event, startDate, endDate) => {
		try {
			return await reportController.exportGoBDData(startDate, endDate);
		} catch (error) {
			console.error("Error exporting GoBD data:", error.message);
			throw error;
		}
	});

	// Generate PDF report
	ipcMain.handle("reports:generatePDF", async (event, reportId) => {
		try {
			return await reportController.generatePDFReport(reportId);
		} catch (error) {
			console.error("Error generating PDF report:", error.message);
			throw error;
		}
	});

	// Generate CSV report
	ipcMain.handle("reports:generateCSV", async (event, reportId) => {
		try {
			return await reportController.generateCSVReport(reportId);
		} catch (error) {
			console.error("Error generating CSV report:", error.message);
			throw error;
		}
	});

	// Download report file
	ipcMain.handle("reports:downloadFile", async (event, filePath) => {
		try {
			if (!fs.existsSync(filePath)) {
				throw new Error("File not found");
			}

			const fileContent = fs.readFileSync(filePath, "utf8");
			const filename = path.basename(filePath);

			return {
				success: true,
				filename: filename,
				content: fileContent,
				contentType: "text/plain",
			};
		} catch (error) {
			console.error("Error downloading file:", error.message);
			throw error;
		}
	});

	// Check if a file exists (for GoBD export buttons)
	ipcMain.handle("reports:fileExists", async (event, filePath) => {
		try {
			return fs.existsSync(filePath);
		} catch {
			return false;
		}
	});

	// Get report statistics
	ipcMain.handle("reports:getStats", async (event, userId) => {
		try {
			return await reportController.getReportStats(userId);
		} catch (error) {
			console.error("Error getting report statistics:", error.message);
			throw error;
		}
	});

	// Manager Reports: Sales by Category
	ipcMain.handle(
		"reports:salesByCategory",
		async (event, startDate, endDate) => {
			try {
				return await reportController.getSalesByCategory(startDate, endDate);
			} catch (error) {
				console.error("Error in salesByCategory:", error.message);
				return { success: false, message: error.message };
			}
		}
	);

	// Manager Reports: Sales by Time
	ipcMain.handle(
		"reports:salesByTime",
		async (event, startDate, endDate, interval) => {
			try {
				return await reportController.getSalesByTime(
					startDate,
					endDate,
					interval
				);
			} catch (error) {
				console.error("Error in salesByTime:", error.message);
				return { success: false, message: error.message };
			}
		}
	);

	// Manager Reports: Sales by Operator
	ipcMain.handle(
		"reports:salesByOperator",
		async (event, startDate, endDate) => {
			try {
				return await reportController.getSalesByOperator(startDate, endDate);
			} catch (error) {
				console.error("Error in salesByOperator:", error.message);
				return { success: false, message: error.message };
			}
		}
	);

	// Manager Reports: Tax/VAT Breakdown
	ipcMain.handle("reports:taxBreakdown", async (event, startDate, endDate) => {
		try {
			return await reportController.getTaxBreakdown(startDate, endDate);
		} catch (error) {
			console.error("Error in taxBreakdown:", error.message);
			return { success: false, message: error.message };
		}
	});
};
