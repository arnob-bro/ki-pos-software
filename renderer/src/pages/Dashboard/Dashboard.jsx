// File: Dashboard.jsx
import React from "react";
import "./Dashboard.css";
import { useState } from "react";
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
  const salesData = [
    { time: "6 AM", sales: 300 },
    { time: "8 AM", sales: 600 },
    { time: "10 AM", sales: 900 },
    { time: "12 PM", sales: 1100 },
    { time: "2 PM", sales: 1300 },
    { time: "4 PM", sales: 1400 },
    { time: "6 PM", sales: 1300 },
    { time: "8 PM", sales: 1000 },
    { time: "10 PM", sales: 700 },
  ];
  
  const productData = [
    { name: language === 'de' ? "Espresso" : "Espresso", value: 400 ,revenue: 1000},
    { name: language === 'de' ? "Latte" : "Latte", value: 300 ,revenue: 900},
    { name: language === 'de' ? "Cappuccino" : "Cappuccino", value: 300 ,revenue: 800},
    { name: language === 'de' ? "Croissant" : "Croissant", value: 200 ,revenue: 700},
    { name: language === 'de' ? "Tee" : "Tea", value: 100 ,revenue: 500}
  ];
  const lowStockItems = [
    { name: language === 'de' ? "Milch" : "Milk", quantity: 3 },
    { name: language === 'de' ? "Zucker" : "Sugar", quantity: 5 },
    { name: language === 'de' ? "Kaffeebohnen" : "Coffee Beans", quantity: 2 },
    { name: language === 'de' ? "Becher" : "Cups", quantity: 4 },
    { name: language === 'de' ? "Servietten" : "Napkins", quantity: 1 },
    { name: language === 'de' ? "Strohhalme" : "Straws", quantity: 6 },
    { name: language === 'de' ? "Teeblätter" : "Tea Leaves", quantity: 2 },
    { name: language === 'de' ? "Schokoladensirup" : "Chocolate Syrup", quantity: 3 }
  ];
  const auditLogs = [
    { action: language === 'de' ? "Anmeldung" : "Login", user: "Admin", timestamp: "2025-07-14 09:12 AM" },
    { action: language === 'de' ? "Z-Bericht erstellt" : "Z-report generated", user: "Admin", timestamp: "2025-07-13 10:00 PM" },
    { action: language === 'de' ? "Rückerstattung angewendet" : "Refund Applied", user: "Manager01", timestamp: "2025-07-13 08:45 PM" },
    { action: language === 'de' ? "Manuelle Bestandsänderung" : "Manual Stock Change", user: "Admin", timestamp: "2025-07-13 07:30 PM" },
    { action: language === 'de' ? "Abmeldung" : "Logout", user: "Admin", timestamp: "2025-07-13 11:00 PM" },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10; // Change this number as needed

// Calculate pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = auditLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(auditLogs.length / logsPerPage);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  // Simple translation map for demo
  const t = (en, de) => language === 'de' ? de : en;

  return (
   <div className="dashboard"> 
   <Sidebar />
    <div className="dashboard-container">
     
      <h1>{role === 1 ? t("Admin Dashboard", "Admin-Dashboard") : t("Manager Dashboard", "Manager-Dashboard")}</h1>

      <div className="dashboard-cards">
         
        {/* Manager Features */}
        {role === 2 && (
          <>
          <div className="dash-card">
            <div className="card">
              <h4>{t("Today's Sales", "Heutiger Umsatz")}</h4>
              <h2>$4,385.00</h2>
              <span className="success">▲ 12.5%</span>
            </div>
        
        <div className="card">
          <h4>{t("Revenue Per Employee", "Umsatz pro Mitarbeiter")}</h4>
          <h2>$877.00</h2>
          <span className="error">▼ 3.4%</span>
        </div>
        <div className="card clickable" onClick={() => setShowLowStockModal(true)}>
           <h4>{t("Low Stock Items", "Niedriger Lagerbestand")}</h4>
           <h2>{lowStockItems.length} {t("items", "Artikel")}</h2>
           <span className="error">▲ 2 {t("items", "Artikel")}</span>
       </div>
       </div> 

    

      <div className="charts-section">
        
        <div className="charts-box">
          <h3>{t("Daily Sales Overview", "Tägliche Umsatzübersicht")}</h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#007bff" strokeWidth={2} />
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
                    {productData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.value}</td>
                        <td>{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
              {showLowStockModal && (
  <div className="modal-overlay" onClick={() => setShowLowStockModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
    <button className="close-btn" onClick={() => setShowLowStockModal(false)}>X</button>
      <h2>📦 {t("Low Stock Items", "Niedriger Lagerbestand")}</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>{t("Item", "Artikel")}</th>
            <th>{t("Remaining Qty", "Verbleibende Menge")}</th>
          </tr>
        </thead>
        <tbody>
          {lowStockItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td style={{ color: item.quantity < 3 ? 'red' : 'orange' }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  </div>
)}
      
      
      
     
          </>
        )}

        {/* Admin Features */}
        {role === 1 && (
          <>
          {/* KPIs */}
          <div className="dash-card">
          <div className="card">
          <h4>{t("Total Sales", "Gesamtumsatz")}</h4>
           <h2>{salesView === "daily" ? "$4,385.00" : "$25,789.00"}</h2>
           <span className="success">{salesView === "daily" ? "▲ 12.5%" : "▲ 7.1%"}</span>
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
            <h2>562</h2>
            <span className="success">▲ 5.3%</span>
          </div>
          <div className="card">
            <h4>{t("Total Customers", "Kunden insgesamt")}</h4>
            <h2>208</h2>
            <span className="error">▼ 2.6%</span>
          </div>
          <div className="card">
            <h4>{t("Total Products", "Produkte insgesamt")}</h4>
            <h2>156</h2>
            <span className="success">+12</span>
          </div>
          <div className="card clickable" onClick={() => setShowLowStockModal(true)}>
           <h4>{t("Low Stock Items", "Niedriger Lagerbestand")}</h4>
           <h2>{lowStockItems.length} {t("items", "Artikel")}</h2>
           <span className="error">▲ 2 {t("items", "Artikel")}</span>
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
                    {productData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.value}</td>
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
            <th>{t("User", "Benutzer")}</th>
            <th>{t("Timestamp", "Zeitstempel")}</th>
           </tr>
            </thead>
          <tbody>
          {currentLogs.map((log, index) => (
          <tr key={index}>
          <td>{log.action}</td>
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
       {showLowStockModal && (
  <div className="modal-overlay" onClick={() => setShowLowStockModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
    <button className="close-btn" onClick={() => setShowLowStockModal(false)}>X</button>
      <h2>📦 {t("Low Stock Items", "Niedriger Lagerbestand")}</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>{t("Item", "Artikel")}</th>
            <th>{t("Remaining Qty", "Verbleibende Menge")}</th>
          </tr>
        </thead>
        <tbody>
          {lowStockItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td style={{ color: item.quantity < 3 ? 'red' : 'orange' }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  </div>
)}
        
          
        </>
        
        )}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
