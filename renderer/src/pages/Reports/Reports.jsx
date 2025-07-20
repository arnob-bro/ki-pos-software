

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import useUserStore from '../../stores/userStore';
import useLanguageStore from '../../stores/languageStore';
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
  const user = useUserStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const t = (en, de) => language === 'de' ? de : en;

  const getUserId = () => user?.id;

  useEffect(() => {
    loadReports();
    loadStats();
    checkZReportExists();
  }, [selectedDate]);

  const checkZReportExists = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setMessage('Error: No user logged in.');
        setZReportExists(false);
        return;
      }
      const result = await window.posAPI.checkZReportExists(selectedDate, userId);
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
      const userId = getUserId();
      if (!userId) {
        setMessage('Error: No user logged in.');
        return;
      }
      const result = await window.posAPI.generateXReport(selectedDate, userId);
      if (result.success) {
        setMessage('X Report generated successfully!');
        loadReports();      // Refresh reports list
        loadStats();        // Refresh stats
        checkZReportExists(); // Refresh Z report state
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
      const userId = getUserId();
      if (!userId) {
        setMessage('Error: No user logged in.');
        return;
      }
      const result = await window.posAPI.generateZReport(selectedDate, userId);
      if (result.success) {
        setMessage('Z Report generated successfully!');
        loadReports();      // Refresh reports list
        loadStats();        // Refresh stats
        checkZReportExists(); // Refresh Z report state
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
      console.log('Calling generatePDFReport for:', reportId); // Debug log before IPC call
      const result = await window.posAPI.generatePDFReport(reportId);
      console.log('generatePDFReport result:', result); // Debug log after IPC call
      if (result.success) {
        setMessage('PDF report generated successfully!');
        console.log('PDF Report Result:', result);
        // Automatically open the generated PDF file if file_path is available
        if (result.data && result.data.file_path) {
          window.posAPI.openFile(result.data.file_path);
        }
      } else {
        setMessage('Error: ' + result.message);
        console.log('PDF Report Error:', result);
      }
    } catch (error) {
      setMessage('Error generating PDF: ' + error.message);
      console.log('Error in downloadPDF:', error); // Debug log for catch
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
        <h1 className="reports-title">{t('📊 Reports Section', '📊 Berichtsbereich')}</h1>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {stats && (
          <div className="stats-section">
            <h3>{t('Report Statistics', 'Berichtsstatistik')}</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.today}</span>
                <span className="stat-label">{t('Today\'s Reports', 'Heutige Berichte')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.month}</span>
                <span className="stat-label">{t('This Month', 'Dieser Monat')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">{t('Total Reports', 'Gesamte Berichte')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="reports-section">
          <h2>{t('X/Z Reports', 'X/Z Berichte')}</h2>
          <p>{t('Access all daily X and Z reports generated by the POS system.', 'Zugang zu allen täglich generierten X- und Z-Berichten des POS-Systems.')}</p>
          
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
              {loading ? t('Generating...', 'Generiere...') : t('Generate X Report', 'X-Bericht generieren')}
            </button>
            <button 
              className={`reports-button ${zReportExists ? 'disabled' : ''}`}
              onClick={generateZReport}
              disabled={loading || zReportExists}
            >
              {loading ? t('Generating...', 'Generiere...') : zReportExists ? t('Z Report Already Generated', 'Z-Bericht bereits generiert') : t('Generate Z Report', 'Z-Bericht generieren')}
            </button>
          </div>
        </div>

        <div className="reports-section">
          <h2>{t('Export GoBD / GDPdU', 'GoBD / GDPdU Exportieren')}</h2>
          <p>{t('Generate export files compliant with German tax audit standards.', 'Generieren Sie Exportdateien, die den deutschen Steuerprüfungsstandards entsprechen.')}</p>
          <button 
            className="reports-button" 
            onClick={() => setShowExportModal(true)}
            disabled={loading}
          >
            {t('Export Formats', 'Exportformate')}
          </button>
        </div>

        <div className="reports-section">
          <h2>{t('Download Archive', 'Archiv herunterladen')}</h2>
          <p>{t('Download archived reports and invoices in PDF format.', 'Laden Sie archivierte Berichte und Rechnungen im PDF-Format herunter.')}</p>
          
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
                    {t('Download PDF', 'PDF herunterladen')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>{t('No reports generated yet.', 'Noch keine Berichte generiert.')}</p>
          )}
        </div>

        <div className="reports-section">
          <h2>{t('Configure Report Schedule', 'Berichtsplanung konfigurieren')}</h2>
          <p>{t('Set up and manage automatic report generation and delivery.', 'Richten Sie die automatische Berichtserstellung und -zustellung ein und verwalten Sie sie.')}</p>
          <button 
            className="reports-button" 
            onClick={configureSchedule}
            disabled={loading}
          >
            {t('Configure Schedule', 'Planung konfigurieren')}
          </button>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{t('Export GoBD Data', 'GoBD-Daten exportieren')}</h3>
              <div className="modal-content">
                <div className="form-group">
                  <label>{t('Start Date', 'Startdatum')}:</label>
                  <input
                    type="date"
                    value={exportDates.startDate}
                    onChange={(e) => setExportDates({...exportDates, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>{t('End Date', 'Enddatum')}:</label>
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
                    {loading ? t('Exporting...', 'Exportiere...') : t('Export', 'Exportieren')}
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => setShowExportModal(false)}
                    disabled={loading}
                  >
                    {t('Cancel', 'Abbrechen')}
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