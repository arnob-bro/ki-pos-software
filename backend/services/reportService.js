const { generatePDF } = require('../utils/pdfGenerator');
const { exportGoBD } = require('../utils/gobdExporter');

class ReportService {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
  }

  /**
   * Generate X Report (daily sales summary)
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} userId - User ID who generated the report
   * @returns {Object} X report data
   */
  async generateXReport(date, userId) {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(total) as total_sales,
          SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cash_sales,
          SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END) as card_sales,
          SUM(CASE WHEN payment_method = 'other' THEN total ELSE 0 END) as other_sales
        FROM transactions 
        WHERE DATE(created_at) = ?
      `);
      
      const report = stmt.get(date);
      
      // Get top selling products for the day
      const productStmt = this.db.prepare(`
        SELECT 
          json_extract(items, '$[*].name') as names,
          json_extract(items, '$[*].qty') as quantities
        FROM transactions 
        WHERE DATE(created_at) = ?
      `);
      
      const sales = productStmt.all(date);
      const productStats = new Map();
      
      for (const sale of sales) {
        try {
          const items = JSON.parse(sale.items);
          for (const item of items) {
            const current = productStats.get(item.name) || 0;
            productStats.set(item.name, current + item.qty);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
      
      const topProducts = Array.from(productStats.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));
      
      const xReport = {
        type: 'X',
        date: date,
        generated_by: userId,
        generated_at: new Date().toISOString(),
        summary: {
          total_transactions: report.total_transactions || 0,
          total_sales: report.total_sales || 0,
          cash_sales: report.cash_sales || 0,
          card_sales: report.card_sales || 0,
          other_sales: report.other_sales || 0
        },
        top_products: topProducts
      };
      
      // Save to generated_reports table
      const insertStmt = this.db.prepare(`
        INSERT INTO generated_reports (id, type, user_id, data_blob)
        VALUES (?, ?, ?, ?)
      `);
      
      const reportId = `x-report-${date}-${Date.now()}`;
      insertStmt.run(reportId, 'x_report', userId, JSON.stringify(xReport));
      
      return xReport;
    } catch (error) {
      throw new Error(`Failed to generate X report: ${error.message}`);
    }
  }

  /**
   * Generate Z Report (end of day summary)
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} userId - User ID who generated the report
   * @returns {Object} Z report data
   */
  async generateZReport(date, userId) {
    try {
      // Check if Z report already exists for this date
      const existingStmt = this.db.prepare(`
        SELECT id FROM generated_reports 
        WHERE type = 'z_report' AND DATE(generated_at) = ? AND user_id = ?
      `);
      const existing = existingStmt.get(date, userId);
      
      if (existing) {
        throw new Error('Z report already exists for this date. Z reports can only be generated once per day.');
      }
      
      // Get X report data for the day
      const xReport = await this.generateXReport(date, userId);
      
      // Get all transactions for the day
      const transactionsStmt = this.db.prepare(`
        SELECT * FROM sales 
        WHERE DATE(created_at) = ?
        ORDER BY created_at
      `);
      
      const transactions = transactionsStmt.all(date);
      
      // Calculate VAT and tax information
      let totalVAT = 0;
      let totalNet = 0;
      
      for (const transaction of transactions) {
        try {
          const items = JSON.parse(transaction.items);
          for (const item of items) {
            const netAmount = item.price * item.qty;
            const vatAmount = netAmount * 0.19; // Assuming 19% VAT
            totalNet += netAmount;
            totalVAT += vatAmount;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
      
      const zReport = {
        type: 'Z',
        date: date,
        generated_by: userId,
        generated_at: new Date().toISOString(),
        summary: {
          ...xReport.summary,
          total_net: totalNet,
          total_vat: totalVAT,
          total_gross: totalNet + totalVAT
        },
        transactions: transactions.map(t => ({
          id: t.id,
          total: t.total,
          payment_method: t.payment_method,
          created_at: t.created_at
        })),
        top_products: xReport.top_products
      };
      
      // Save to generated_reports table with proper type identification
      const insertStmt = this.db.prepare(`
        INSERT INTO generated_reports (id, type, user_id, data_blob)
        VALUES (?, ?, ?, ?)
      `);
      
      const reportId = `z-report-${date}`;
      insertStmt.run(reportId, 'z_report', userId, JSON.stringify(zReport));
      
      return zReport;
    } catch (error) {
      throw new Error(`Failed to generate Z report: ${error.message}`);
    }
  }

  /**
   * Check if Z report exists for a given date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} userId - User ID
   * @returns {Object} Check result
   */
  async checkZReportExists(date, userId) {
    try {
      const stmt = this.db.prepare(`
        SELECT id FROM generated_reports 
        WHERE type = 'z_report' AND DATE(generated_at) = ? AND user_id = ?
      `);
      const existing = stmt.get(date, userId);
      
      return {
        success: true,
        exists: !!existing
      };
    } catch (error) {
      throw new Error(`Failed to check Z report existence: ${error.message}`);
    }
  }

  /**
   * Get all generated reports
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Reports with pagination
   */
  async getGeneratedReports(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const stmt = this.db.prepare(`
        SELECT gr.*, u.name as user_name
        FROM generated_reports gr
        LEFT JOIN users u ON gr.user_id = u.id
        ORDER BY gr.generated_at DESC
        LIMIT ? OFFSET ?
      `);
      
      const reports = stmt.all(limit, offset);
      
      // Get total count
      const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM generated_reports');
      const { total } = countStmt.get();
      
      const parsedReports = reports.map(report => ({
        ...report,
        data: report.data_blob ? JSON.parse(report.data_blob) : null
      }));
      
      return {
        reports: parsedReports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get generated reports: ${error.message}`);
    }
  }

  /**
   * Export GoBD compliant data
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Object} Export result
   */
  async exportGoBDData(startDate, endDate) {
    try {
      // Get all transactions in date range
      const stmt = this.db.prepare(`
        SELECT * FROM sales 
        WHERE DATE(created_at) BETWEEN ? AND ?
        ORDER BY created_at
      `);
      
      const transactions = stmt.all(startDate, endDate);
      
      // Format data for GoBD export
      const gobdData = transactions.map(transaction => ({
        transaction_id: transaction.id,
        date: transaction.created_at,
        total: transaction.total,
        payment_method: transaction.payment_method,
        items: JSON.parse(transaction.items)
      }));
      
      // Generate GoBD export file
      const exportResult = await exportGoBD(gobdData, startDate, endDate);
      
      return {
        success: true,
        message: 'GoBD export generated successfully',
        file_path: exportResult.filePath,
        record_count: gobdData.length
      };
    } catch (error) {
      throw new Error(`Failed to export GoBD data: ${error.message}`);
    }
  }

  /**
   * Generate PDF report
   * @param {string} reportId - Report ID
   * @returns {Object} PDF generation result
   */
  async generatePDFReport(reportId) {
    try {
      const stmt = this.db.prepare(`
        SELECT gr.*, u.name as user_name
        FROM generated_reports gr
        LEFT JOIN users u ON gr.user_id = u.id
        WHERE gr.id = ?
      `);
      
      const report = stmt.get(reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Check if data_blob exists and is valid
      if (!report.data_blob) {
        throw new Error('Report data is missing or corrupted');
      }
      
      let reportData;
      try {
        reportData = JSON.parse(report.data_blob);
      } catch (parseError) {
        throw new Error('Report data is corrupted and cannot be parsed');
      }
      
      // Validate that reportData has required fields
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('Report data is invalid');
      }
      
      // Ensure required fields exist with defaults
      const validatedReportData = {
        date: reportData.date || new Date().toISOString().split('T')[0],
        generated_by: reportData.generated_by || report.user_name || 'Unknown',
        generated_at: reportData.generated_at || report.generated_at,
        type: reportData.type || report.type,
        summary: reportData.summary || {},
        top_products: reportData.top_products || [],
        transactions: reportData.transactions || []
      };
      
      const pdfResult = await generatePDF(validatedReportData, report.type);
      
      return {
        success: true,
        message: 'Report generated successfully',
        data: pdfResult
      };
    } catch (error) {
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }

  /**
   * Get report statistics
   * @returns {Object} Report statistics
   */
  async getReportStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Today's reports
      const todayStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM generated_reports 
        WHERE DATE(generated_at) = ?
      `);
      const todayReports = todayStmt.get(today);
      
      // This month's reports
      const monthStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM generated_reports 
        WHERE strftime('%Y-%m', generated_at) = strftime('%Y-%m', 'now')
      `);
      const monthReports = monthStmt.get();
      
      // Total reports
      const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM generated_reports');
      const totalReports = totalStmt.get();
      
      return {
        today: todayReports.count || 0,
        month: monthReports.count || 0,
        total: totalReports.count || 0
      };
    } catch (error) {
      throw new Error(`Failed to get report statistics: ${error.message}`);
    }
  }
}

module.exports = ReportService;
