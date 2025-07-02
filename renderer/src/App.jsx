//sample code for now

import { useEffect, useState, useCallback, useMemo } from 'react';
import './App.css';

// Debounce hook for search optimization
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  // Product state with pagination
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock_quantity: '0' });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms debounce

  // Cart state
  const [cart, setCart] = useState([]);
  
  // Transactions (was sales) history with pagination
  const [transactions, setTransactions] = useState([]);
  const [transactionsPagination, setTransactionsPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  
  // Loading states
  const [loading, setLoading] = useState({ products: false, transactions: false });

  // Load products and transactions on mount
  useEffect(() => {
    refreshProducts();
    refreshTransactions();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearch) {
      searchProducts(debouncedSearch);
    } else {
      refreshProducts();
    }
  }, [debouncedSearch]);

  const refreshProducts = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const result = await window.posAPI.listProducts(page, 20); // Limit to 20 items
      setProducts(result.products || result);
      if (result.pagination) {
        setProductPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const searchProducts = async (query) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const result = await window.posAPI.searchProducts(query, 20);
      setProducts(result.products || []);
      if (result.pagination) {
        setProductPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const refreshTransactions = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const result = await window.posAPI.listTransactions(page, 20); // Limit to 20 items
      setTransactions(result);
      // Pagination can be added if backend supports it
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Memoized product add handler
  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || newProduct.stock_quantity === '') return;
    const stockQty = parseInt(newProduct.stock_quantity, 10);
    console.log('Submitting stock_quantity:', stockQty, typeof stockQty);
    if (isNaN(stockQty) || stockQty < 0) {
      alert('Stock quantity must be a non-negative number');
      return;
    }
    try {
      await window.posAPI.addProduct({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock_quantity: stockQty,
      });
      setNewProduct({ name: '', price: '', stock_quantity: '0' });
      refreshProducts(1); // Reset to first page
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Error: ${error.message}`);
    }
  }, [newProduct]);

  // Memoized cart handlers
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.qty < product.stock_quantity
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateCartQty = useCallback((id, qty, stock_quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, Math.min(qty, stock_quantity)) } : item
      )
    );
  }, []);

  // Memoized cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  // Memoized checkout handler (addTransaction)
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      // You may want to get user_id, payment_method, etc. from context or UI
      const transaction = {
        user_id: 'user-1', // Using the seeded user ID
        payment_method: 'cash', // Replace with actual payment method
        total_amount: cartTotal,
        vat_amount: 0,
        discount_amount: 0,
        items: cart.map(({ id, name, price, qty }) => ({
          product_id: id,
          quantity: qty,
          unit_price: price,
          vat_amount: 0,
          discount_applied: 0,
        })),
      };
      await window.posAPI.addTransaction(transaction);
      setCart([]);
      refreshProducts(1);
      refreshTransactions(1);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert(`Checkout failed: ${error.message}`);
    }
  }, [cart, cartTotal]);

  // Product change handler
  const handleProductChange = useCallback((e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  }, [newProduct]);

  return (
    <div className="pos-container">
      <h1>Simple POS System</h1>
      
      <div className="pos-sections">
        {/* Product Management */}
        <section>
          <h2>Products</h2>
          
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Add Product Form */}
          <form onSubmit={handleAddProduct} className="product-form">
            <input
              name="name"
              placeholder="Name"
              value={newProduct.name}
              onChange={handleProductChange}
              required
            />
            <input
              name="price"
              type="number"
              step="0.01"
              placeholder="Price"
              value={newProduct.price}
              onChange={handleProductChange}
              required
            />
            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              placeholder="Stock"
              value={newProduct.stock_quantity}
              onChange={handleProductChange}
              required
            />
            <button type="submit" disabled={loading.products}>
              {loading.products ? 'Adding...' : 'Add Product'}
            </button>
          </form>

          {/* Products Table */}
          {loading.products ? (
            <div className="loading">Loading products...</div>
          ) : (
            <>
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.stock_quantity}</td>
                      <td>
                        <button 
                          onClick={() => addToCart(p)} 
                          disabled={p.stock_quantity === 0}
                          className="add-to-cart-btn"
                        >
                          Add to Cart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {productPagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => refreshProducts(productPagination.page - 1)}
                    disabled={productPagination.page <= 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {productPagination.page} of {productPagination.totalPages}
                  </span>
                  <button 
                    onClick={() => refreshProducts(productPagination.page + 1)}
                    disabled={productPagination.page >= productPagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Cart */}
        <section>
          <h2>Cart</h2>
          {cart.length === 0 ? (
            <p>Cart is empty.</p>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={item.stock_quantity}
                          value={item.qty}
                          onChange={(e) => updateCartQty(item.id, parseInt(e.target.value, 10), item.stock_quantity)}
                          style={{ width: '3em' }}
                        />
                      </td>
                      <td>${(item.price * item.qty).toFixed(2)}</td>
                      <td>
                        <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cart-total">
                <strong>Total: ${cartTotal.toFixed(2)}</strong>
              </div>
              <button onClick={handleCheckout} disabled={cart.length === 0} className="checkout-btn">
                Checkout
              </button>
            </>
          )}
        </section>

        {/* Transactions History */}
        <section>
          <h2>Transactions History</h2>
          {loading.transactions ? (
            <div className="loading">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <>
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td>
                        {tx.items.map((item) => (
                          <div key={item.id}>
                            Product: {item.product_id} x{item.quantity} @ ${item.unit_price.toFixed(2)}
                          </div>
                        ))}
                      </td>
                      <td>${parseFloat(tx.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination can be added here if backend supports it */}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
