import React, { useState, useEffect } from "react";
import "./ReceiptArchive.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const sampleReceipts = [
  {
    id: 1,
    date: "2025-06-01",
    operator: "Admin",
    total: 500,
    tax: 75,
    items: [
      { name: "Latte", qty: 2, price: 5.0 },
      { name: "Croissant", qty: 1, price: 3.0 },
    ],
  },
  {
    id: 2,
    date: "2025-06-02",
    operator: "Staff1",
    total: 300,
    tax: 45,
    items: [
      { name: "Espresso", qty: 3, price: 4.0 },
      { name: "Cake", qty: 2, price: 6.0 },
    ],
  },
  {
    id: 3,
    date: "2025-06-02",
    operator: "Admin",
    total: 150,
    tax: 22.5,
    items: [
      { name: "Bread", qty: 1, price: 2.0 },
      { name: "Apples", qty: 3, price: 5.0 },
    ],
  },
  {
    id: 4,
    date: "2025-06-02",
    operator: "Admin",
    total: 150,
    tax: 22.5,
    items: [
      { name: "Bread", qty: 1, price: 2.0 },
      { name: "Apples", qty: 3, price: 5.0 },
    ],
  },
];

const ReceiptArchive = () => {
  const [filteredReceipts, setFilteredReceipts] = useState(sampleReceipts);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const filtered = sampleReceipts.filter(
      (r) =>
        (!dateFilter || r.date === dateFilter) &&
        (!operatorFilter || r.operator === operatorFilter) &&
        (!idFilter || r.id.toString().includes(idFilter))
    );
    setFilteredReceipts(filtered);
  }, [dateFilter, operatorFilter, idFilter]);

  const totalTax = filteredReceipts.reduce((sum, r) => sum + r.tax, 0);
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.total, 0);

  const handlePrint = () => {
    
  }
  return (
    <div className="receipt-archive">
      <Sidebar />
      <div className="receipt-list-section">
        {/* <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button> */}
        <h2>🧾 Receipt Archive</h2>

        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Search by ID"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
          >
            <option value="">All Operators</option>
            <option value="Admin">Admin</option>
            <option value="Staff1">Staff1</option>
          </select>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Operator</th>
              <th>Total</th>
              <th>Tax</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelectedReceipt(r)}
                style={{ cursor: "pointer" }}
              >
                <td>{r.id}</td>
                <td>{r.date}</td>
                <td>{r.operator}</td>
                <td>${r.total.toFixed(2)}</td>
                <td>${r.tax.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tax-summary">
          <h4>📊 Tax Summary</h4>
          <p><strong>Total Tax:</strong> ${totalTax.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {selectedReceipt && (
        <div className="receipt-details-panel receipt-style">
          <button className="close-btn" onClick={() => setSelectedReceipt(null)}>✖</button>
          <h2 className="store-title">SUPERMARKET</h2>
          <p className="store-info">Lorem ipsum 258</p>
          <p className="store-info">City Index - 02025</p>
          <p className="store-info">Tel.: +456-468-987-02</p>

          <hr className="dotted" />

          <p><strong>Cashier:</strong> #{selectedReceipt.id}</p>
          <p><strong>Manager:</strong> {selectedReceipt.operator}</p>

          <hr className="dotted" />

          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {selectedReceipt.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="dotted" />

          <div className="summary">
            <p><strong>Sub Total:</strong> ${selectedReceipt.total.toFixed(2)}</p>
            <p><strong>Tax:</strong> ${selectedReceipt.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> ${(selectedReceipt.total + selectedReceipt.tax).toFixed(2)}</p>
            <p><strong>Cash:</strong> ${(selectedReceipt.total + selectedReceipt.tax + 20).toFixed(2)}</p>
            <p><strong>Change:</strong> $20.00</p>
            <button onClick={() => window.print()}>🖨️ Print / Save PDF</button>
          </div>

          <hr className="dotted" />

          <div className="barcode">[||||||||||||||||||||||]</div>

          <div className="thank-you">
            <p>THANK YOU!</p>
            <p>Glad to see you again!</p>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReceiptArchive;
