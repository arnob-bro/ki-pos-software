

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

  // Manager report states
  const [managerDateRange, setManagerDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const [timeData, setTimeData] = useState([]);
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [timeInterval, setTimeInterval] = useState('day');

  const [operatorData, setOperatorData] = useState([]);
  const [operatorLoading, setOperatorLoading] = useState(false);
  const [operatorError, setOperatorError] = useState('');

  const [taxData, setTaxData] = useState([]);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState('');

  const [gobdExportFiles, setGobdExportFiles] = useState([]);

  const getUserId = () => user?.id;

  useEffect(() => {
    loadReports();
    loadStats();
    checkZReportExists();
  }, [selectedDate]);

  useEffect(() => {
    if (user?.role_id === 2) {
      fetchCategoryData();
      fetchTimeData();
      fetchOperatorData();
      fetchTaxData();
    }
    // eslint-disable-next-line
  }, [managerDateRange, timeInterval, user]);

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
      const userId = getUserId();
      const result = await window.posAPI.listReports(userId);
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
      const userId = getUserId();
      const result = await window.posAPI.getReportStats(userId);
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
    setLoading(true);
    setMessage('');
    setGobdExportFiles([]);
    try {
      const result = await window.posAPI.exportGoBD(exportDates.startDate, exportDates.endDate);
      console.log('GoBD export result:', result);
      let files = [];
      if (result && result.data && Array.isArray(result.data.files)) {
        files = result.data.files;
      }
      console.log('Files extracted:', files);
      if (result.success && files.length > 0) {
        setMessage('GoBD export completed successfully!');
        setGobdExportFiles(files);
        setShowExportModal(false);
      } else if (result.success) {
        setMessage('GoBD export completed successfully, but file path is missing.');
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

  const downloadCSV = async (reportId) => {
    try {
      setLoading(true);
      setMessage('');
      const result = await window.posAPI.generateCSVReport(reportId);
      if (result.success) {
        setMessage('CSV report generated successfully!');
        if (result.data && result.data.file_path) {
          window.posAPI.openFile(result.data.file_path);
        }
      } else {
        setMessage('Error: ' + result.message);
      }
    } catch (error) {
      setMessage('Error generating CSV: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const configureSchedule = () => {
    setMessage('Report scheduling feature coming soon!');
  };

  const fetchCategoryData = async () => {
    setCategoryLoading(true); setCategoryError('');
    try {
      const res = await window.posAPI.reports_salesByCategory(managerDateRange.startDate, managerDateRange.endDate);
      if (Array.isArray(res)) setCategoryData(res);
      else setCategoryError('Failed to load data');
    } catch (e) { setCategoryError(e.message); }
    setCategoryLoading(false);
  };
  const fetchTimeData = async () => {
    setTimeLoading(true); setTimeError('');
    try {
      const res = await window.posAPI.reports_salesByTime(managerDateRange.startDate, managerDateRange.endDate, timeInterval);
      if (Array.isArray(res)) setTimeData(res);
      else setTimeError('Failed to load data');
    } catch (e) { setTimeError(e.message); }
    setTimeLoading(false);
  };
  const fetchOperatorData = async () => {
    setOperatorLoading(true); setOperatorError('');
    try {
      const res = await window.posAPI.reports_salesByOperator(managerDateRange.startDate, managerDateRange.endDate);
      if (Array.isArray(res)) setOperatorData(res);
      else setOperatorError('Failed to load data');
    } catch (e) { setOperatorError(e.message); }
    setOperatorLoading(false);
  };
  const fetchTaxData = async () => {
    setTaxLoading(true); setTaxError('');
    try {
      const res = await window.posAPI.reports_taxBreakdown(managerDateRange.startDate, managerDateRange.endDate);
      if (Array.isArray(res)) setTaxData(res);
      else setTaxError('Failed to load data');
    } catch (e) { setTaxError(e.message); }
    setTaxLoading(false);
  };

  return (
    <div className="reports-container">
      <Sidebar />
      <div className="reports-content">
        <h1 className="reports-title">{t('📊 Reports Section', '📊 Berichtsbereich')}</h1>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
            {gobdExportFiles.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                {gobdExportFiles.map((file) => {
                  const fileName = file.split(/[/\\]/).pop();
                  return (
                    <button
                      key={file}
                      className="download-btn"
                      onClick={() => window.posAPI.openFile(file)}
                      style={{ minWidth: 160 }}
                    >
                      Open {fileName}
                    </button>
                  );
                })}
              </div>
            )}
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

        {/* GoBD Export Section - Only for non-managers */}
        {user?.role_id !== 2 && (
          <div className="reports-section">
            <h2>Export GoBD-compliant</h2>
            <p>Generate export files compliant with German tax audit standards.</p>
            <button 
              className="reports-button" 
              onClick={() => setShowExportModal(true)}
              disabled={loading}
            >
              Export Formats
            </button>
          </div>
        )}

        <div className="reports-section">
          <h2>{t('Download Archive', 'Archiv herunterladen')}</h2>
          <p>{t('Download archived reports and invoices in PDF format.', 'Laden Sie archivierte Berichte und Rechnungen im PDF-Format herunter.')}</p>
          
          {reports.length > 0 ? (
            <div className="reports-list">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="report-item">
                  <span>{report.type} Report - {new Date(report.generated_at).toLocaleDateString()}</span>
                  <div className="button-group">
                  <button 
                    className="download-btn"
                    onClick={() => downloadPDF(report.id)}
                    disabled={loading}
                  >
                    Download PDF
                  </button>
                  <button
                    className="download-btn"
                    onClick={() => downloadCSV(report.id)}
                    disabled={loading}
                  >
                    Download CSV
                  </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t('No reports generated yet.', 'Noch keine Berichte generiert.')}</p>
          )}
        </div>

        {/* Configure Report Schedule - Only for non-managers */}
        {user?.role_id !== 2 && (
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
        )}

        {/* Manager-Only Reports Section */}
        {user?.role_id === 2 &&  (
          <div className="reports-section manager-reports">
            <h2>Manager-Only Reports</h2>
            {/* Date Range Picker */}
            <div className="manager-date-range">
              <label>Start Date: <input type="date" value={managerDateRange.startDate} onChange={e => setManagerDateRange(d => ({...d, startDate: e.target.value}))} /></label>
              <label>End Date: <input type="date" value={managerDateRange.endDate} onChange={e => setManagerDateRange(d => ({...d, endDate: e.target.value}))} /></label>
            </div>
            {/* Sales by Category */}
            <div className="manager-report-block">
              <h3>Sales by Category</h3>
              {categoryLoading ? <div className="placeholder loading">Loading...</div> :
                categoryError ? <div className="error">{categoryError}</div> :
                <table className="manager-table"><thead><tr><th>Category</th><th>Total Sales</th><th>Quantity Sold</th></tr></thead><tbody>
                  {categoryData.length === 0 ? <tr><td colSpan="3">No data</td></tr> :
                    categoryData.map((row, i) => <tr key={i}><td>{row.category}</td><td>{row.total_sales?.toFixed(2)}</td><td>{row.quantity_sold}</td></tr>)}
                </tbody></table>}
            </div>
            {/* Sales by Time */}
            <div className="manager-report-block">
              <h3>Sales by Time</h3>
              <div className="manager-time-interval">
                <label>Interval: 
                  <select value={timeInterval} onChange={e => setTimeInterval(e.target.value)}>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                  </select>
                </label>
              </div>
              {timeLoading ? <div className="placeholder loading">Loading...</div> :
                timeError ? <div className="error">{timeError}</div> :
                <table className="manager-table"><thead><tr><th>Interval</th><th>Total Sales</th><th>Transactions</th></tr></thead><tbody>
                  {timeData.length === 0 ? <tr><td colSpan="3">No data</td></tr> :
                    timeData.map((row, i) => <tr key={i}><td>{row.interval_label}</td><td>{row.total_sales?.toFixed(2)}</td><td>{row.transactions}</td></tr>)}
                </tbody></table>}
            </div>
            {/* Sales by Operator */}
            <div className="manager-report-block">
              <h3>Sales by Operator</h3>
              {operatorLoading ? <div className="placeholder loading">Loading...</div> :
                operatorError ? <div className="error">{operatorError}</div> :
                <table className="manager-table"><thead><tr><th>Operator</th><th>Total Sales</th><th>Transactions</th></tr></thead><tbody>
                  {operatorData.length === 0 ? <tr><td colSpan="3">No data</td></tr> :
                    operatorData.map((row, i) => <tr key={i}><td>{row.operator_name}</td><td>{row.total_sales?.toFixed(2)}</td><td>{row.transactions}</td></tr>)}
                </tbody></table>}
            </div>
            {/* Tax/VAT Breakdown */}
            <div className="manager-report-block">
              <h3>Tax/VAT Breakdown</h3>
              {taxLoading ? <div className="placeholder loading">Loading...</div> :
                taxError ? <div className="error">{taxError}</div> :
                <table className="manager-table"><thead><tr><th>Tax Rate</th><th>Net Sales</th><th>Tax Amount</th><th>Gross Sales</th></tr></thead><tbody>
                  {taxData.length === 0 ? <tr><td colSpan="4">No data</td></tr> :
                    taxData.map((row, i) => <tr key={i}><td>{row.tax_label}</td><td>{row.net_sales?.toFixed(2)}</td><td>{row.tax_amount?.toFixed(2)}</td><td>{row.gross_sales?.toFixed(2)}</td></tr>)}
                </tbody></table>}
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 style={{marginTop:0, marginBottom:8}}>Export GoBD-compliant</h2>
              <div style={{color:'#666', marginBottom:18, fontSize:'15px'}}>Generate a legally compliant export for your selected date range.</div>
              <div className="modal-content" style={{gap: '0'}}>
                <div style={{display:'flex', gap: '18px', marginBottom: '18px'}}>
                  <div className="form-group" style={{flex:1}}>
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={exportDates.startDate}
                      onChange={(e) => setExportDates({...exportDates, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label>End Date</label>
                    <input
                      type="date"
                      value={exportDates.endDate}
                      onChange={(e) => setExportDates({...exportDates, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-buttons" style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'10px'}}>
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