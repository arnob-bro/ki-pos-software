// ReportAPI.js

class ReportAPI {
  constructor(backend = window.posAPI) {
    this.backend = backend;
  }
  checkZReportExists(date, userId) {
    return this.backend.checkZReportExists(date, userId);
  }
  listReports() {
    return this.backend.listReports();
  }
  getReportStats() {
    return this.backend.getReportStats();
  }
  generateXReport(date, userId) {
    return this.backend.generateXReport(date, userId);
  }
  generateZReport(date, userId) {
    return this.backend.generateZReport(date, userId);
  }
  exportGoBD(startDate, endDate) {
    return this.backend.exportGoBD(startDate, endDate);
  }
  generatePDFReport(reportId) {
    return this.backend.generatePDFReport(reportId);
  }
  openFile(filePath) {
    return this.backend.openFile(filePath);
  }
}

const reportAPI = new ReportAPI();
export default reportAPI;
