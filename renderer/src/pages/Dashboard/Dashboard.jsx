// File: Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Sidebar from "../../components/Sidebar";
import useUserStore from "../../stores/userStore";
import useLanguageStore from "../../stores/languageStore";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const role = user?.role_id;
  const language = useLanguageStore((state) => state.language);
  const [salesView, setSalesView] = useState("daily");
  
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [salesStats, setSalesStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      window.posAPI.getSalesStats(salesView),
      window.posAPI.getTopProducts(5),
      window.posAPI.getLowStockItems(5),
      window.posAPI.getAuditLogs(currentPage, logsPerPage),
      window.posAPI.getTotalProducts()
    ]).then(([stats, products, lowStock, audit, totalProductsRes]) => {
      setSalesStats(stats);
      setTopProducts(products);
      setLowStockItems(lowStock);
      setAuditLogs(audit.logs);
      setAuditTotal(audit.total);
      setTotalProducts(totalProductsRes.total || 0);
      setLoading(false);
    }).catch((err) => {
      setError("Failed to load dashboard data");
      setLoading(false);
    });
  }, [salesView, currentPage]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const t = (en, de) => language === 'de' ? de : en;

  // Pagination for audit logs
  const totalPages = Math.ceil(auditTotal / logsPerPage);
  console.log(auditLogs)

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-container">
        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <h1>{role === 1 ? t("Admin Dashboard", "Admin-Dashboard") : t("Manager Dashboard", "Manager-Dashboard")}</h1>
            <div className="dashboard-cards">
              {role === 2 && (
                <>
                  <div className="dash-card">
                    <div className="card">
                      <h4>{t("Today's Sales", "Heutiger Umsatz")}</h4>
                      <h2>${salesStats?.total?.toLocaleString() || '0.00'}</h2>
                      <span className="success">▲ {salesStats?.transactions || 0} {t("transactions", "Transaktionen")}</span>
                    </div>
                    <div className="card">
                      <h4>{t("Revenue Per Employee", "Umsatz pro Mitarbeiter")}</h4>
                      <h2>$877.00</h2>
                      <span className="error">▼ 3.4%</span>
                    </div>
                    <div className="card clickable" onClick={() => setShowLowStockModal(true)}>
                      <h4>{t("Low Stock Items", "Niedriger Lagerbestand")}</h4>
                      <h2>{lowStockItems.length} {t("items", "Artikel")}</h2>
                      <span className="error">▲ {lowStockItems.length} {t("items", "Artikel")}</span>
                    </div>
                  </div>
                  <div className="charts-section">
                    <div className="charts-box">
                      <h3>{t("Daily Sales Overview", "Tägliche Umsatzübersicht")}</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[]}>
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          {/* You can add a real sales trend here if you have time-based data */}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="charts-box">
                      <h3>{t("Top 5 Products", "Top 5 Produkte")}</h3>
                      <table className="product-table">
                        <thead>
                          <tr>
                            <th>{t("Product", "Produkt")}</th>
                            <th>{t("Sold Unit", "Verkaufte Einheit")}</th>
                            <th>{t("Revenue", "Umsatz")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.sold}</td>
                              <td>{item.revenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              {role === 1 && (
                <>
                  {/* KPIs */}
                  <div className="dash-card">
                    <div className="card">
                      <h4>{t("Total Sales", "Gesamtumsatz")}</h4>
                      <h2>${salesStats?.total?.toLocaleString() || '0.00'}</h2>
                      <span className="success">▲ {salesStats?.transactions || 0} {t("transactions", "Transaktionen")}</span>
                      <div className="radio-group">
                        <label>
                          <input
                            type="radio"
                            value="daily"
                            checked={salesView === "daily"}
                            onChange={(e) => setSalesView(e.target.value)} />
                          {t("Daily", "Täglich")}
                        </label>
                        <label style={{ marginLeft: "10px" }}>
                          <input
                            type="radio"
                            value="monthly"
                            checked={salesView === "monthly"}
                            onChange={(e) => setSalesView(e.target.value)}
                          />
                          {t("Monthly", "Monatlich")}
                        </label>
                      </div>
                    </div>
                    <div className="card">
                      <h4>{t("Total Transactions", "Transaktionen insgesamt")}</h4>
                      <h2>{salesStats?.transactions || 0}</h2>
                      <span className="success">▲ 5.3%</span>
                    </div>
                    {/* <div className="card">
                      <h4>{t("Total Customers", "Kunden insgesamt")}</h4>
                      <h2>208</h2>
                      <span className="error">▼ 2.6%</span>
                    </div> */}
                    <div className="card">
                      <h4>{t("Total Products", "Produkte insgesamt")}</h4>
                      <h2>{totalProducts}</h2>
                      <span className="success">+12</span>
                    </div>
                    <div className="card clickable" onClick={() => setShowLowStockModal(true)}>
                      <h4>{t("Low Stock Items", "Niedriger Lagerbestand")}</h4>
                      <h2>{lowStockItems.length} {t("items", "Artikel")}</h2>
                      <span className="error">▲ {lowStockItems.length} {t("items", "Artikel")}</span>
                    </div>
                  </div>
                  {/* Z-Reports Section */}
                  <div className="chart-row">
                    <div className="chart-box z-reports">
                      <h3>🧾 {t("Latest Z-Reports", "Neueste Z-Berichte")}</h3>
                      <ul className="z-report-list">
                        <li>
                          <strong>{t("June 30, 2025", "30. Juni 2025")}</strong> – {t("Total Sales", "Gesamtumsatz")}: $4,200 – {t("Transactions", "Transaktionen")}: 86
                        </li>
                        <li>
                          <strong>{t("June 29, 2025", "29. Juni 2025")}</strong> – {t("Total Sales", "Gesamtumsatz")}: $3,950 – {t("Transactions", "Transaktionen")}: 80
                        </li>
                        <li>
                          <strong>{t("June 28, 2025", "28. Juni 2025")}</strong> – {t("Total Sales", "Gesamtumsatz")}: $4,100 – {t("Transactions", "Transaktionen")}: 84
                        </li>
                      </ul>
                    </div>
                    <div className="chart-box">
                      <h3>{t("Top 5 Products", "Top 5 Produkte")}</h3>
                      <table className="product-table">
                        <thead>
                          <tr>
                            <th>{t("Product", "Produkt")}</th>
                            <th>{t("Sold Unit", "Verkaufte Einheit")}</th>
                            <th>{t("Revenue", "Umsatz")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.sold}</td>
                              <td>{item.revenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="audit-trail">
                      <h3>🔍 {t("Audit Trail", "Prüfprotokoll")}</h3>
                      <div className="audit-wrapper">
                        <table className="audit-table">
                          <thead>
                            <tr>
                              <th>{t("Action", "Aktion")}</th>
                              <th>{t("Table", "Tabelle")}</th>
                              <th>{t("User", "Benutzer")}</th>
                              <th>{t("Timestamp", "Zeitstempel")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLogs.map((log, index) => (
                              <tr key={index}>
                                <td>{log.action}</td>
                                <td>{log.table_name || '-'}</td>
                                <td>{log.user}</td>
                                <td>{log.timestamp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="pagination-controls">
                          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                            ◀ {t("Prev", "Zurück")}
                          </button>
                          <span>
                            {t("Page", "Seite")} {currentPage} {t("of", "von")} {totalPages}
                          </span>
                          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                            {t("Next", "Weiter")} ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
