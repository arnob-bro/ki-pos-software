const { generatePDF } = require('../utils/pdfGenerator');
const { generateCSV } = require('../utils/csvGenerator');
const { exportGoBD } = require('../utils/gobdExporter');
const fs = require('fs'); // Added for file size calculation

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
      // Check if user exists
      const userCheck = this.db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!userCheck) {
        throw new Error(`Failed to generate X report: userId '${userId}' does not exist in users table.`);
      }
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(total_amount) as total_sales,
          SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_sales,
          SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END) as card_sales,
          SUM(CASE WHEN payment_method = 'other' THEN total_amount ELSE 0 END) as other_sales
        FROM transactions 
        WHERE DATE(timestamp) = ?
      `);
      
      const report = stmt.get(date);
      
      // Get top selling products for the day
      const productStmt = this.db.prepare(`
        SELECT ti.product_id, p.name, SUM(ti.quantity) as total_qty
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE DATE(t.timestamp) = ?
        GROUP BY ti.product_id, p.name
        ORDER BY total_qty DESC
        LIMIT 5
      `);
      
      const topProducts = productStmt.all(date).map(row => ({ name: row.name, qty: row.total_qty }));
      
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
      console.error('ReportService error in generateXReport:', error);
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
      // Check if user exists
      const userCheck = this.db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
      if (!userCheck) {
        throw new Error(`Failed to generate Z report: userId '${userId}' does not exist in users table.`);
      }
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
        SELECT * FROM transactions 
        WHERE DATE(timestamp) = ?
        ORDER BY timestamp
      `);
      
      const transactions = transactionsStmt.all(date);
      
      // Calculate VAT and tax information
      let totalVAT = 0;
      let totalNet = 0;
      
      // Get all transaction items for the day
      const itemsStmt = this.db.prepare(`
        SELECT ti.*, p.vat_rate, p.price
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE DATE(t.timestamp) = ?
      `);
      const items = itemsStmt.all(date);
      for (const item of items) {
        const netAmount = item.price * item.quantity;
        const vatAmount = netAmount * (item.vat_rate / 100);
        totalNet += netAmount;
        totalVAT += vatAmount;
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
          total: t.total_amount,
          payment_method: t.payment_method,
          created_at: t.timestamp
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
      console.error('ReportService error in generateZReport:', error);
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
      console.error('ReportService error in checkZReportExists:', error);
      throw new Error(`Failed to check Z report existence: ${error.message}`);
    }
  }

  /**
   * Get all generated reports
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Reports with pagination
   */
  async getGeneratedReports(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      let stmt, reports;
      if (userId) {
        stmt = this.db.prepare(`
          SELECT gr.*, u.name as user_name
          FROM generated_reports gr
          LEFT JOIN users u ON gr.user_id = u.id
          WHERE gr.user_id = ?
          ORDER BY gr.generated_at DESC
          LIMIT ? OFFSET ?
        `);
        reports = stmt.all(userId, limit, offset);
      } else {
        stmt = this.db.prepare(`
          SELECT gr.*, u.name as user_name
          FROM generated_reports gr
          LEFT JOIN users u ON gr.user_id = u.id
          ORDER BY gr.generated_at DESC
          LIMIT ? OFFSET ?
        `);
        reports = stmt.all(limit, offset);
      }
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
      console.error('ReportService error in getGeneratedReports:', error);
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
      const txStmt = this.db.prepare(`
        SELECT * FROM transactions 
        WHERE DATE(timestamp) BETWEEN ? AND ?
        ORDER BY timestamp
      `);
      const transactions = txStmt.all(startDate, endDate);

      // Get all transaction items in date range
      const itemsStmt = this.db.prepare(`
        SELECT ti.*, p.name as product_name, p.category_id, p.barcode as sku, p.vat_rate, c.name as category
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE DATE(t.timestamp) BETWEEN ? AND ?
      `);
      const items = itemsStmt.all(startDate, endDate);

      // Fill in net, vat, gross for each transaction
      transactions.forEach(tx => {
        // Find all items for this transaction
        const txItems = items.filter(i => i.transaction_id === tx.id);
        const net = txItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
        const vat = txItems.reduce((sum, i) => sum + (i.vat_amount || 0), 0);
        tx.net_amount = net.toFixed(2);
        tx.vat_amount = vat.toFixed(2);
        // Use the highest VAT rate in the transaction for summary (for now)
        tx.vat_rate = txItems.length > 0 ? Math.max(...txItems.map(i => i.vat_rate || 0)) : '';
        // Placeholder for correction/cancellation flags, receipt number
        tx.correction_flag = '';
        tx.cancelled_flag = '';
        tx.receipt_number = tx.id;
      });

      // Fill in VAT amount for each item
      items.forEach(i => {
        // Calculate VAT per item if not present
        if (i.vat_amount == null) {
          i.vat_amount = ((i.unit_price * i.quantity) * (i.vat_rate || 0) / 100).toFixed(2);
        }
      });

      // Financial summary
      const totalGross = transactions.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);
      const totalNet = items.reduce((sum, i) => sum + ((parseFloat(i.unit_price) || 0) * (parseFloat(i.quantity) || 0)), 0);
      const totalVAT = items.reduce((sum, i) => sum + (parseFloat(i.vat_amount) || 0), 0);
      const avgTxnValue = transactions.length ? totalGross / transactions.length : 0;
      const highestTxn = Math.max(...transactions.map(t => parseFloat(t.total_amount) || 0), 0);
      const lowestTxn = Math.min(...transactions.map(t => parseFloat(t.total_amount) || 0), 0);

      // Payment method breakdown
      const cashTxns = transactions.filter(t => t.payment_method === 'cash');
      const cardTxns = transactions.filter(t => t.payment_method === 'card');
      const otherTxns = transactions.filter(t => t.payment_method === 'other');
      const cashTotal = cashTxns.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);
      const cardTotal = cardTxns.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);
      const otherTotal = otherTxns.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);

      // Product summary
      const totalItemsSold = items.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);
      const uniqueProductsSold = new Set(items.map(i => i.product_id)).size;
      // Top selling products
      const productSales = {};
      items.forEach(i => {
        if (!productSales[i.product_name]) productSales[i.product_name] = 0;
        productSales[i.product_name] += parseFloat(i.quantity) || 0;
      });
      const sortedProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
      const topProduct = sortedProducts[0] ? `${sortedProducts[0][0]} (${sortedProducts[0][1]} units)` : '';
      const secondProduct = sortedProducts[1] ? `${sortedProducts[1][0]} (${sortedProducts[1][1]} units)` : '';

      // VAT summary
      const vatRate = items.length > 0 ? (items[0].vat_rate || 19) : 19;
      // Transaction statistics
      const avgItemsPerTxn = transactions.length ? totalItemsSold / transactions.length : 0;
      // Peak and slowest sales hour
      const hourCounts = {};
      transactions.forEach(t => {
        const hour = new Date(t.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      let peakHour = '', slowestHour = '';
      if (Object.keys(hourCounts).length > 0) {
        const peak = Object.entries(hourCounts).reduce((a, b) => a[1] > b[1] ? a : b);
        const slow = Object.entries(hourCounts).reduce((a, b) => a[1] < b[1] ? a : b);
        peakHour = `${String(peak[0]).padStart(2, '0')}:00-${String(Number(peak[0])+1).padStart(2, '0')}:00 (${peak[1]} transactions)`;
        slowestHour = `${String(slow[0]).padStart(2, '0')}:00-${String(Number(slow[0])+1).padStart(2, '0')}:00 (${slow[1]} transactions)`;
      }

      // Export details
      const fileSize = null; // Will be filled after file is written
      const exportStart = Date.now();
      const currentUser = 'current-user'; // Optionally fetch from session

      // Prepare summary object
      const summary = {
        exportSummary: {
          startDate,
          endDate,
          totalRecords: transactions.length,
          exportDate: new Date().toISOString().split('T')[0],
          exportTime: new Date().toTimeString().split(' ')[0]
        },
        financialSummary: {
          totalGross,
          totalNet,
          totalVAT,
          avgTxnValue,
          highestTxn,
          lowestTxn
        },
        paymentBreakdown: {
          cashTxns: cashTxns.length,
          cashTotal,
          cardTxns: cardTxns.length,
          cardTotal,
          otherTxns: otherTxns.length,
          otherTotal
        },
        productSummary: {
          totalItemsSold,
          uniqueProductsSold,
          topProduct,
          secondProduct
        },
        vatSummary: {
          totalVAT,
          vatRate,
          netBeforeVAT: totalNet
        },
        txnStats: {
          totalTxns: transactions.length,
          avgItemsPerTxn,
          peakHour,
          slowestHour
        },
        exportDetails: {
          fileSize, // Will be filled after file is written
          recordsProcessed: transactions.length,
          exportDuration: null, // Will be filled after file is written
          generatedBy: currentUser
        }
      };

      // Generate GoBD export files (detailed records)
      const exportResult = await exportGoBD(summary, transactions, items, {}, this.db);
      console.log('GoBD exportResult:', exportResult); // DEBUG LOG
      // Return a plain serializable object
      return JSON.parse(JSON.stringify({
        success: true,
        files: exportResult.files,
        baseName: exportResult.baseName
      }));
    } catch (error) {
      console.error('ReportService error in exportGoBDData:', error);
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
      
      // Check if data_blob exists and is not null
      if (!report.data_blob) {
        throw new Error('Report data is missing or corrupted');
      }
      
      let reportData;
      try {
        reportData = JSON.parse(report.data_blob);
      } catch (parseError) {
        throw new Error('Report data is corrupted and cannot be parsed');
      }
      
      // Validate that reportData has required properties
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('Report data is invalid');
      }
      
      const pdfResult = await generatePDF(reportData, report.type);
      
      return {
        success: true,
        message: 'PDF report generated successfully',
        file_path: pdfResult.filePath
      };
    } catch (error) {
      console.error('ReportService error in generatePDFReport:', error);
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }

  /**
   * Generate CSV report
   * @param {string} reportId - Report ID
   * @returns {Object} CSV generation result
   */
  async generateCSVReport(reportId) {
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
      if (!report.data_blob) {
        throw new Error('Report data is missing or corrupted');
      }
      let reportData;
      try {
        reportData = JSON.parse(report.data_blob);
      } catch (parseError) {
        throw new Error('Report data is corrupted and cannot be parsed');
      }
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('Report data is invalid');
      }
      const csvResult = await generateCSV(reportData, report.type);
      return {
        success: true,
        message: 'CSV report generated successfully',
        file_path: csvResult.filePath
      };
    } catch (error) {
      console.error('ReportService error in generateCSVReport:', error);
      throw new Error(`Failed to generate CSV report: ${error.message}`);
    }
  }

  /**
   * Get report statistics
   * @returns {Object} Report statistics
   */
  async getReportStats(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      let todayStmt, monthStmt, totalStmt, todayReports, monthReports, totalReports;
      if (userId) {
        todayStmt = this.db.prepare(`
          SELECT COUNT(*) as count FROM generated_reports 
          WHERE DATE(generated_at) = ? AND user_id = ?
        `);
        todayReports = todayStmt.get(today, userId);
        monthStmt = this.db.prepare(`
          SELECT COUNT(*) as count FROM generated_reports 
          WHERE strftime('%Y-%m', generated_at) = strftime('%Y-%m', 'now') AND user_id = ?
        `);
        monthReports = monthStmt.get(userId);
        totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM generated_reports WHERE user_id = ?');
        totalReports = totalStmt.get(userId);
      } else {
        todayStmt = this.db.prepare(`
          SELECT COUNT(*) as count FROM generated_reports 
          WHERE DATE(generated_at) = ?
        `);
        todayReports = todayStmt.get(today);
        monthStmt = this.db.prepare(`
          SELECT COUNT(*) as count FROM generated_reports 
          WHERE strftime('%Y-%m', generated_at) = strftime('%Y-%m', 'now')
        `);
        monthReports = monthStmt.get();
        totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM generated_reports');
        totalReports = totalStmt.get();
      }
      return {
        today: todayReports.count || 0,
        month: monthReports.count || 0,
        total: totalReports.count || 0
      };
    } catch (error) {
      console.error('ReportService error in getReportStats:', error);
      throw new Error(`Failed to get report statistics: ${error.message}`);
    }
  }

  // Sales by Category
  async getSalesByCategory(startDate, endDate) {
    try {
      const stmt = this.db.prepare(`
        SELECT c.name as category, 
               SUM(ti.quantity * ti.unit_price) as total_sales, 
               SUM(ti.quantity) as quantity_sold
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE DATE(t.timestamp) BETWEEN ? AND ?
        GROUP BY c.name
      `);
      return stmt.all(startDate, endDate);
    } catch (error) {
      console.error('ReportService error in getSalesByCategory:', error);
      throw error;
    }
  }

  // Sales by Time
  async getSalesByTime(startDate, endDate, interval = 'day') {
    try {
      let groupBy, labelExpr;
      if (interval === 'hour') {
        groupBy = "strftime('%Y-%m-%d %H', t.timestamp)";
        labelExpr = "strftime('%Y-%m-%d %H:00', t.timestamp)";
      } else if (interval === 'week') {
        groupBy = "strftime('%Y-W%W', t.timestamp)";
        labelExpr = "strftime('%Y-W%W', t.timestamp)";
      } else {
        groupBy = "DATE(t.timestamp)";
        labelExpr = "DATE(t.timestamp)";
      }
      const stmt = this.db.prepare(`
        SELECT ${labelExpr} as interval_label,
               SUM(ti.quantity * ti.unit_price) as total_sales,
               COUNT(DISTINCT t.id) as transactions
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE DATE(t.timestamp) BETWEEN ? AND ?
        GROUP BY ${groupBy}
        ORDER BY interval_label
      `);
      return stmt.all(startDate, endDate);
    } catch (error) {
      console.error('ReportService error in getSalesByTime:', error);
      throw error;
    }
  }

  // Sales by Operator
  async getSalesByOperator(startDate, endDate) {
    try {
      const stmt = this.db.prepare(`
        SELECT u.name as operator_name,
               SUM(ti.quantity * ti.unit_price) as total_sales,
               COUNT(DISTINCT t.id) as transactions
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN transaction_items ti ON ti.transaction_id = t.id
        WHERE DATE(t.timestamp) BETWEEN ? AND ?
        GROUP BY u.name
      `);
      return stmt.all(startDate, endDate);
    } catch (error) {
      console.error('ReportService error in getSalesByOperator:', error);
      throw error;
    }
  }

  // Tax/VAT Breakdown
  async getTaxBreakdown(startDate, endDate) {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          p.vat_rate as tax_label,
          SUM(ti.quantity * ti.unit_price) as net_sales,
          SUM(ti.quantity * ti.unit_price * (p.vat_rate / 100.0)) as tax_amount,
          SUM(ti.quantity * ti.unit_price * (1 + p.vat_rate / 100.0)) as gross_sales
        FROM transaction_items ti
        JOIN products p ON ti.product_id = p.id
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE DATE(t.timestamp) BETWEEN ? AND ?
        GROUP BY p.vat_rate
      `);
      return stmt.all(startDate, endDate);
    } catch (error) {
      console.error('ReportService error in getTaxBreakdown:', error);
      throw error;
    }
  }
}

module.exports = ReportService;