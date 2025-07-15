import React, { useState, useEffect, useCallback } from "react";
import "./ReceiptArchive.css";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import Sidebar from "../../components/Sidebar";

const sampleReceipts = [
  {
    id: 1,
    date: "2025-06-01",
    operator: "Admin",
    total: 500,
    tax: 75,
    payment_method: "Cash",
    taxpayerId: "TXP-239812",
    jurisdiction: "Dhaka North",
    vatRate: 15,
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
    payment_method: "Cash",
    taxpayerId: "TXP-239812",
    jurisdiction: "Dhaka North",
    vatRate: 15,
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
    taxpayerId: "TXP-239812",
    payment_method: "Cash",
    jurisdiction: "Dhaka North",
    vatRate: 15,
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
    payment_method: "Cash",
    taxpayerId: "TXP-239812",
    jurisdiction: "Dhaka North",
    vatRate: 15,
    items: [
      { name: "Bread", qty: 1, price: 2.0 },
      { name: "Apples", qty: 3, price: 5.0 },
    ],
  },
  // Add more sample data to demonstrate pagination
  // {
  //   id: 5,
  //   date: "2025-06-03",
  //   operator: "Staff1",
  //   total: 250,
  //   tax: 37.5,
  //   items: [
  //     { name: "Coffee", qty: 2, price: 3.5 },
  //     { name: "Sandwich", qty: 1, price: 8.0 },
  //   ],
  // },
  // {
  //   id: 6,
  //   date: "2025-06-03",
  //   operator: "Admin",
  //   total: 180,
  //   tax: 27,
  //   items: [
  //     { name: "Tea", qty: 1, price: 2.5 },
  //     { name: "Cookie", qty: 2, price: 1.5 },
  //   ],
  // },
  // {
  //   id: 7,
  //   date: "2025-06-04",
  //   operator: "Staff1",
  //   total: 320,
  //   tax: 48,
  //   items: [
  //     { name: "Cappuccino", qty: 2, price: 4.5 },
  //     { name: "Muffin", qty: 1, price: 3.0 },
  //   ],
  // },
  // {
  //   id: 8,
  //   date: "2025-06-04",
  //   operator: "Admin",
  //   total: 420,
  //   tax: 63,
  //   items: [
  //     { name: "Hot Chocolate", qty: 1, price: 4.0 },
  //     { name: "Croissant", qty: 2, price: 3.5 },
  //   ],
  // },
];

const ReceiptArchive = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  // Fetch receipts from database with pagination
  const fetchReceipts = useCallback(async (filters = {}, page = 1, append = false) => {
    setLoading(true);
    try {
      const limit = 50; // Items per page
      const offset = (page - 1) * limit;
      
      const result = await window.posAPI.getReceipts({
        ...filters,
        limit,
        offset
      });
      
      if (append) {
        setReceipts(prev => [...prev, ...result]);
        setFilteredReceipts(prev => [...prev, ...result]);
      } else {
        setReceipts(result);
        setFilteredReceipts(result);
      }
      
      // Check if there are more results
      setHasMore(result.length === limit);
      setTotalCount(prev => append ? prev + result.length : result.length);
      
      // Extract unique operators for the dropdown
      const uniqueOperators = [...new Set(result.map(r => r.operator))];
      setOperators(prev => {
        const combined = [...new Set([...prev, ...uniqueOperators])];
        return combined;
      });
    } catch (error) {
      console.error('Error fetching receipts:', error);
      if (!append) {
        setReceipts([]);
        setFilteredReceipts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchReceipts({}, 1, false);
    setCurrentPage(1);
  }, [fetchReceipts]);

  // Apply filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = {};
      if (dateFilter) filters.date = dateFilter;
      if (operatorFilter) filters.operator = operatorFilter;
      if (idFilter) filters.id = idFilter;
      
      // Reset pagination when filters change
      setCurrentPage(1);
      fetchReceipts(filters, 1, false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [dateFilter, operatorFilter, idFilter, fetchReceipts]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const filters = {};
      if (dateFilter) filters.date = dateFilter;
      if (operatorFilter) filters.operator = operatorFilter;
      if (idFilter) filters.id = idFilter;
      
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchReceipts(filters, nextPage, true);
    }
  }, [loading, hasMore, currentPage, dateFilter, operatorFilter, idFilter, fetchReceipts]);

  // Calculate pagination
  const totalPages = Math.ceil(sampleReceipts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentReceipts = sampleReceipts.slice(startIndex, endIndex);

  // Calculate totals
  const totalTax = sampleReceipts.reduce((sum, r) => sum + r.tax, 0);
  const totalAmount = sampleReceipts.reduce((sum, r) => sum + r.total, 0);

  const handleDownload = () => {
    const element = document.querySelector(".receipt-style");

  const opt = {
    margin:       0.5,
    filename:     `receipt-${selectedReceipt.id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();

  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        ← Previous
      </button>
    );

    // First page button (if not visible)
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page button (if not visible)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next →
      </button>
    );

    return buttons;
  };
  

  return (
    <div className="receipt-archive">
      <Sidebar />
      <div className="receipt-list-section">
        {/* <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button> */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🧾 Receipt Archive</h2>
          <button 
            onClick={() => {
              setCurrentPage(1);
              fetchReceipts({}, 1, false);
            }} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
       
        <div className="tax-cards">
      <div className="tax-card">
        <h4>Total Receipts</h4>
        <p>{sampleReceipts.length}</p>
      </div>
      <div className="tax-card">
        <h4>Total Tax</h4>
        <p>${totalTax.toFixed(2)}</p>
      </div>
      <div className="tax-card">
        <h4>Total Amount</h4>
        <p>${totalAmount.toFixed(2)}</p>
      </div>
      </div>

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
            {operators.map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </div>

        {/* Page size selector */}
        <div className="page-size-selector">
          <label>Show:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            
          </select>
        </div>

        {loading && <div className="loading">Loading receipts...</div>}
        
        {!loading && sampleReceipts.length === 0 && (
          <div className="no-receipts">No receipts found</div>
        )}
        
        {!loading && sampleReceipts.length > 0 && (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="receipt-table">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Operator</th>
                  <th>Payment Method</th>
                  <th>Total</th>
                  <th>Tax</th>
                </tr>
              </thead>
              <tbody>
                {currentReceipts.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReceipt(r)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{r.id}</td>
                    <td>{r.date}</td>
                    <td>{r.operator}</td>
                    <td>{r.payment_method}</td>
                    <td>${r.total.toFixed(2)}</td>
                    <td>${r.tax.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination info */}
        <div className="pagination-info">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredReceipts.length)} of {filteredReceipts.length} receipts
          </span>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            {renderPaginationButtons()}
          </div>
        )}
      </div>

      {selectedReceipt && (
        <div className="receipt-details-panel receipt-style">
          <button className="close-btn" onClick={() => setSelectedReceipt(null)}>✖</button>
          <h2 className="store-title">SUPERMARKET</h2>
          <p className="store-info">Lorem ipsum 258</p>
          <p className="store-info">City Index - 02025</p>
          <p className="store-info">Tel.: +456-468-987-02</p>

          <hr className="dotted" />

          <p><strong>Receipt ID:</strong> {selectedReceipt.id}</p>
          <p><strong>Cashier:</strong> {selectedReceipt.operator}</p>
          <p><strong>Payment Method:</strong> {selectedReceipt.payment_method}</p>
          <div className="tax-info">
                       <h4>🧾 Tax Compliance Info</h4>
                        <p><strong>Taxpayer ID:</strong> {selectedReceipt.taxpayerId || "N/A"}</p>
                        <p><strong>Jurisdiction:</strong> {selectedReceipt.jurisdiction || "N/A"}</p>
                        <p><strong>VAT Rate:</strong> {selectedReceipt.vatRate ? `${selectedReceipt.vatRate}%` : "N/A"}</p>
                    </div>
                    

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
            <p><strong>Sub Total:</strong> ${(selectedReceipt.total - selectedReceipt.tax).toFixed(2)}</p>
            <p><strong>Tax:</strong> ${selectedReceipt.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> ${selectedReceipt.total.toFixed(2)}</p>
            <p><strong>Cash:</strong> ${(selectedReceipt.total + 20).toFixed(2)}</p>
            <p><strong>Change:</strong> $20.00</p>
            <button onClick={() => window.print()}>🖨️ Print Receipt</button>
            <button onClick={handleDownload}>🖨️ Download</button>
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
