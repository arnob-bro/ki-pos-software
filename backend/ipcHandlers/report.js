const ReportService = require('../services/reportService');
const ReportController = require('../controllers/reportController');

module.exports = function registerReportHandlers(ipcMain, db) {
  const reportService = new ReportService(db);
  const reportController = new ReportController(reportService);

  // Generate X Report
  ipcMain.handle('reports:generateX', async (event, date, userId) => {
    try {
      return await reportController.generateXReport(date, userId);
    } catch (error) {
      console.error('Error generating X report:', error.message);
      throw error;
    }
  });

  // Generate Z Report
  ipcMain.handle('reports:generateZ', async (event, date, userId) => {
    try {
      return await reportController.generateZReport(date, userId);
    } catch (error) {
      console.error('Error generating Z report:', error.message);
      throw error;
    }
  });

  // Get all generated reports
  ipcMain.handle('reports:list', async (event, page = 1, limit = 20) => {
    try {
      return await reportController.getGeneratedReports(page, limit);
    } catch (error) {
      console.error('Error listing reports:', error.message);
      throw error;
    }
  });

  // Check if Z report exists
  ipcMain.handle('reports:checkZReportExists', async (event, date, userId) => {
    return await reportController.checkZReportExists(date, userId);
  });

  // Export GoBD data
  ipcMain.handle('reports:exportGoBD', async (event, startDate, endDate) => {
    try {
      return await reportController.exportGoBDData(startDate, endDate);
    } catch (error) {
      console.error('Error exporting GoBD data:', error.message);
      throw error;
    }
  });

  // Generate PDF report
  ipcMain.handle('reports:generatePDF', async (event, reportId) => {
    try {
      return await reportController.generatePDFReport(reportId);
    } catch (error) {
      console.error('Error generating PDF report:', error.message);
      throw error;
    }
  });

  // Download report file
  ipcMain.handle('reports:downloadFile', async (event, filePath) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      return {
        success: true,
        filename: filename,
        content: fileContent,
        contentType: 'text/plain'
      };
    } catch (error) {
      console.error('Error downloading file:', error.message);
      throw error;
    }
  });

  // Get report statistics
  ipcMain.handle('reports:getStats', async () => {
    try {
      return await reportController.getReportStats();
    } catch (error) {
      console.error('Error getting report statistics:', error.message);
      throw error;
    }
  });
};
