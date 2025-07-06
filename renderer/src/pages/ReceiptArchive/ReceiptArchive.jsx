import React, { useState, useEffect, useCallback } from "react";
import "./ReceiptArchive.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const ReceiptArchive = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

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

  const totalTax = filteredReceipts.reduce((sum, r) => sum + r.tax, 0);
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.total, 0);

  const handlePrint = () => {
    
  }
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

        {loading && <div className="loading">Loading receipts...</div>}
        
        {!loading && filteredReceipts.length === 0 && (
          <div className="no-receipts">No receipts found</div>
        )}
        
        {!loading && filteredReceipts.length > 0 && (
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
                {filteredReceipts.map((r) => (
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

        <div className="tax-summary">
          <h4>📊 Tax Summary</h4>
          <p><strong>Total Tax:</strong> ${totalTax.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
          <p><strong>Showing:</strong> {filteredReceipts.length} receipts</p>
        </div>

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={loadMore}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? 'Loading...' : '📄 Load More Receipts'}
            </button>
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
