//sample code for now

import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // Product state
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  // Cart state
  const [cart, setCart] = useState([]);
  // Sales history
  const [sales, setSales] = useState([]);

  // Load products and sales on mount
  useEffect(() => {
    refreshProducts();
    refreshSales();
  }, []);

  const refreshProducts = async () => {
    const list = await window.posAPI.listProducts();
    setProducts(list);
  };
  const refreshSales = async () => {
    const list = await window.posAPI.listSales();
    setSales(list);
  };

  // Product add form handlers
  const handleProductChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    await window.posAPI.addProduct({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock, 10),
    });
    setNewProduct({ name: '', price: '', stock: '' });
    refreshProducts();
  };

  // Cart handlers
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.qty < product.stock
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };
  const updateCartQty = (id, qty, stock) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, Math.min(qty, stock)) } : item
      )
    );
  };
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    await window.posAPI.addSale({
      items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      total: cartTotal,
    });
    setCart([]);
    refreshProducts();
    refreshSales();
  };

  return (
    <div className="pos-container">
      <h1>Simple POS System</h1>
      <div className="pos-sections">
        {/* Product Management */}
        <section>
          <h2>Products</h2>
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
              name="stock"
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={handleProductChange}
              required
            />
            <button type="submit">Add Product</button>
          </form>
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
                  <td>{p.stock}</td>
                  <td>
                    <button onClick={() => addToCart(p)} disabled={p.stock === 0}>
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Cart */}
        <section>
          <h2>Cart</h2>
          {cart.length === 0 ? (
            <p>Cart is empty.</p>
          ) : (
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
                        max={item.stock}
                        value={item.qty}
                        onChange={(e) => updateCartQty(item.id, parseInt(e.target.value, 10), item.stock)}
                        style={{ width: '3em' }}
                      />
                    </td>
                    <td>${(item.price * item.qty).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="cart-total">
            <strong>Total: ${cartTotal.toFixed(2)}</strong>
          </div>
          <button onClick={handleCheckout} disabled={cart.length === 0}>
            Checkout
          </button>
        </section>

        {/* Sales History */}
        <section>
          <h2>Sales History</h2>
          {sales.length === 0 ? (
            <p>No sales yet.</p>
          ) : (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.created_at).toLocaleString()}</td>
                    <td>
                      {sale.items.map((item) => (
                        <div key={item.id}>
                          {item.name} x{item.qty} @ ${item.price.toFixed(2)}
                        </div>
                      ))}
                    </td>
                    <td>${sale.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
