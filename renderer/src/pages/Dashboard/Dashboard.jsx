// File: Dashboard.jsx
import React from "react";
import "./Dashboard.css";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import useUserStore from "../../stores/userStore";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const role = user?.role_id;
  
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
    { name: "Espresso", value: 400 },
    { name: "Latte", value: 300 },
    { name: "Cappuccino", value: 300 },
    { name: "Croissant", value: 200 },
  ];
  const lowStockItems = [
    { name: "Milk", quantity: 3 },
    { name: "Sugar", quantity: 5 },
    { name: "Coffee Beans", quantity: 2 },
    { name: "Cups", quantity: 4 },
    { name: "Napkins", quantity: 1 },
    { name: "Straws", quantity: 6 },
    { name: "Tea Leaves", quantity: 2 },
    { name: "Chocolate Syrup", quantity: 3 }
  ];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  
  
  return (
   <div className="dashboard"> 
   <Sidebar />
    <div className="dashboard-container">
     
      <h1>{role === 1 ? "Admin Dashboard" : "Manager Dashboard"}</h1>

      <div className="dashboard-cards">
         
        {/* Manager Features */}
        {role != 1 && (
          <>
              <div className="card">
                <h4>Today's Sales</h4>
                <h2>$4,385.00</h2>
                <span className="success">▲ 12.5%</span>
              </div>
          
              <div className="card">
                <h4>Revenue Per Employee</h4>
                <h2>$877.00</h2>
                <span className="error">▼ 3.4%</span>
              </div>
              <div className="card clickable" onClick={() => setShowLowStockModal(true)}>
                <h4>Low Stock Items</h4>
                <h2>{lowStockItems.length} items</h2>
                <span className="error">▲ 2 items</span>
            </div>
        

    

              <div className="charts-section">
                <div className="chart-box">
                  <h3>Sales Overview</h3>
                  <div className="tabs">
                    <span className="tab active">Daily</span>
                    
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#007bff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-box">
                        <h3>Top 5 Products</h3>
                        <table className="product-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Sales</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productData.map((item, index) => (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                </div>
              {showLowStockModal && (
                <div className="modal-overlay" onClick={() => setShowLowStockModal(false)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <button className="close-btn" onClick={() => setShowLowStockModal(false)}>X</button>
                    <h2>📦 Low Stock Items</h2>
                    <table className="product-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Remaining Qty</th>
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
          <div className="card">
            <h4>Total Sales</h4>
            <h2>$25,789.00</h2>
            <span className="success">▲ 7.1%</span>
          </div>
          <div className="card">
            <h4>Total Transactions</h4>
            <h2>562</h2>
            <span className="success">▲ 5.3%</span>
          </div>
          <div className="card">
            <h4>Total Customers</h4>
            <h2>208</h2>
            <span className="error">▼ 2.6%</span>
          </div>
          <div className="card">
            <h4>Total Products</h4>
            <h2>156</h2>
            <span className="success">+12</span>
          </div>
        
          {/* Z-Reports Section */}
          <div className="chart-box z-reports">
            <h3>🧾 Latest Z-Reports</h3>
            <ul className="z-report-list">
              <li>
                <strong>June 30, 2025</strong> – Total Sales: $4,200 – Transactions: 86
              </li>
              <li>
                <strong>June 29, 2025</strong> – Total Sales: $3,950 – Transactions: 80
              </li>
              <li>
                <strong>June 28, 2025</strong> – Total Sales: $4,100 – Transactions: 84
              </li>
            </ul>
          </div>
        
          {/* Device Status Section */}
          <div className="chart-box device-statuses">
            <h3>💻 Device Statuses</h3>
            <table className="device-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>POS #1</td>
                  <td>Cashier Counter</td>
                  <td><span className="status online">Online</span></td>
                </tr>
                <tr>
                  <td>POS #2</td>
                  <td>Beverage Corner</td>
                  <td><span className="status offline">Offline</span></td>
                </tr>
                <tr>
                  <td>POS #3</td>
                  <td>Express Checkout</td>
                  <td><span className="status online">Online</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
        )}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
