

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import './Reports.css';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDates, setExportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [zReportExists, setZReportExists] = useState(false);

  useEffect(() => {
    loadReports();
    loadStats();
    checkZReportExists();
  }, [selectedDate]);

  const checkZReportExists = async () => {
    try {
      const result = await window.posAPI.checkZReportExists(selectedDate, 'current-user');
      setZReportExists(result.exists);
    } catch (error) {
      console.error('Error checking Z report existence:', error);
      setZReportExists(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const result = await window.posAPI.listReports();
      if (result.success) {
        setReports(result.data.reports);
      }
    } catch (error) {
      setMessage('Error loading reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await window.posAPI.getReportStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateXReport = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const result = await window.posAPI.generateXReport(selectedDate, 'current-user');
      
      if (result.success) {
        setMessage('X Report generated successfully!');
        loadReports(); // Refresh the reports list
      } else {
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      setMessage('Error generating X report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateZReport = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const result = await window.posAPI.generateZReport(selectedDate, 'current-user');
      
      if (result.success) {
        setMessage('Z Report generated successfully!');
        loadReports(); // Refresh the reports list
      } else {
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      // Handle specific error for duplicate Z report
      if (error.message.includes('already exists for this date')) {
        setMessage('Z Report already exists for this date. Z reports can only be generated once per day.');
      } else {
        setMessage('Error generating Z report: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const exportGoBD = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const result = await window.posAPI.exportGoBD(exportDates.startDate, exportDates.endDate);
      
      if (result.success) {
        setMessage('GoBD export completed successfully!');
        setShowExportModal(false);
      } else {
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      setMessage('Error exporting GoBD data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (reportId) => {
    try {
      setLoading(true);
      setMessage('');
      
      const result = await window.posAPI.generatePDFReport(reportId);
      
      if (result.success) {
        setMessage('PDF report generated successfully!');
      } else {
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      setMessage('Error generating PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const configureSchedule = () => {
    setMessage('Report scheduling feature coming soon!');
  };

  return (
    <div className="reports-container">
      <Sidebar />
      <div className="reports-content">
        <h1 className="reports-title">Reports Section</h1>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {stats && (
          <div className="stats-section">
            <h3>Report Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.today}</span>
                <span className="stat-label">Today's Reports</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.month}</span>
                <span className="stat-label">This Month</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Reports</span>
              </div>
            </div>
          </div>
        )}

        <div className="reports-section">
          <h2>X/Z Reports</h2>
          <p>Access all daily X and Z reports generated by the POS system.</p>
          
          <div className="date-picker">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="button-group">
            <button 
              className="reports-button" 
              onClick={generateXReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate X Report'}
            </button>
            <button 
              className={`reports-button ${zReportExists ? 'disabled' : ''}`}
              onClick={generateZReport}
              disabled={loading || zReportExists}
            >
              {loading ? 'Generating...' : zReportExists ? 'Z Report Already Generated' : 'Generate Z Report'}
            </button>
          </div>
        </div>

        <div className="reports-section">
          <h2>Export GoBD / GDPdU</h2>
          <p>Generate export files compliant with German tax audit standards.</p>
          <button 
            className="reports-button" 
            onClick={() => setShowExportModal(true)}
            disabled={loading}
          >
            Export Formats
          </button>
        </div>

        <div className="reports-section">
          <h2>Download Archive</h2>
          <p>Download archived reports and invoices in PDF format.</p>
          
          {reports.length > 0 ? (
            <div className="reports-list">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="report-item">
                  <span>{report.type} Report - {new Date(report.generated_at).toLocaleDateString()}</span>
                  <button 
                    className="download-btn"
                    onClick={() => downloadPDF(report.id)}
                    disabled={loading}
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No reports generated yet.</p>
          )}
        </div>

        <div className="reports-section">
          <h2>Configure Report Schedule</h2>
          <p>Set up and manage automatic report generation and delivery.</p>
          <button 
            className="reports-button" 
            onClick={configureSchedule}
            disabled={loading}
          >
            Configure Schedule
          </button>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Export GoBD Data</h3>
              <div className="modal-content">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={exportDates.startDate}
                    onChange={(e) => setExportDates({...exportDates, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={exportDates.endDate}
                    onChange={(e) => setExportDates({...exportDates, endDate: e.target.value})}
                  />
                </div>
                <div className="modal-buttons">
                  <button 
                    className="reports-button"
                    onClick={exportGoBD}
                    disabled={loading}
                  >
                    {loading ? 'Exporting...' : 'Export'}
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => setShowExportModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
