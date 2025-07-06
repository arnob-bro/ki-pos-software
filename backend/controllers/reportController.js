class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  /**
   * Generate X Report
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} userId - User ID
   * @returns {Object} X report result
   */
  async generateXReport(date, userId) {
    try {
      // Validate date format
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }

      const report = await this.reportService.generateXReport(date, userId);
      
      return {
        success: true,
        message: 'X report generated successfully',
        data: report
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: 'X_REPORT_ERROR'
      };
    }
  }

  /**
   * Generate Z Report
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} userId - User ID
   * @returns {Object} Z report result
   */
  async generateZReport(date, userId) {
    try {
      // Validate date format
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }

      const report = await this.reportService.generateZReport(date, userId);
      
      return {
        success: true,
        message: 'Z report generated successfully',
        data: report
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: 'Z_REPORT_ERROR'
      };
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
      const result = await this.reportService.checkZReportExists(date, userId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get all generated reports
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Reports result
   */
  async getGeneratedReports(page = 1, limit = 20) {
    try {
      const result = await this.reportService.getGeneratedReports(page, limit);
      
      return {
        success: true,
        message: 'Reports retrieved successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: 'GET_REPORTS_ERROR'
      };
    }
  }

  /**
   * Export GoBD data
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Object} Export result
   */
  async exportGoBDData(startDate, endDate) {
    try {
      // Validate date format
      if (!startDate || !endDate || 
          !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || 
          !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('Start date cannot be after end date');
      }

      const result = await this.reportService.exportGoBDData(startDate, endDate);
      
      return {
        success: true,
        message: 'GoBD export completed successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: 'GOBD_EXPORT_ERROR'
      };
    }
  }

  /**
   * Generate PDF report
   * @param {string} reportId - Report ID
   * @returns {Object} PDF generation result
   */
  async generatePDFReport(reportId) {
    try {
      if (!reportId) {
        throw new Error('Report ID is required');
      }

      const result = await this.reportService.generatePDFReport(reportId);
      
      return {
        success: true,
        message: 'PDF report generated successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: 'PDF_GENERATION_ERROR'
      };
    }
  }

  /**
   * Get report statistics
   * @returns {Object} Statistics result
   */
  async getReportStats() {
    try {
      const stats = await this.reportService.getReportStats();
      
      return {
        success: true,
        message: 'Report statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        code: 'STATS_ERROR'
      };
    }
  }
}

module.exports = ReportController;
