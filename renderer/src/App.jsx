//sample code for now

//import { useEffect, useState, useCallback, useMemo } from 'react';
//import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  
//import Login from './pages/Login/Login';
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ReceiptArchive from './pages/ReceiptArchive/ReceiptArchive';
import ProductManagement from './pages/ProductManagement/ProductManagement';

function App() {
	return (
		<Routes>
			<Route path='/' element={<Login />} />
		  <Route path='/dashboard' element={<Dashboard />} />
		  <Route path='/receipt-archive' element={<ReceiptArchive />} />
		  <Route path='/product-management' element={<ProductManagement />} />
		</Routes>
	);
}

export default App;

// // Debounce hook for search optimization
// function useDebounce(value, delay) {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// function App() {
//   // Product state with pagination
//   const [products, setProducts] = useState([]);
//   const [productPagination, setProductPagination] = useState({ page: 1, total: 0, totalPages: 0 });
//   const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
//   const [searchQuery, setSearchQuery] = useState('');
//   const debouncedSearch = useDebounce(searchQuery, 300); // 300ms debounce

//   // Cart state
//   const [cart, setCart] = useState([]);
  
//   // Sales history with pagination
//   const [sales, setSales] = useState([]);
//   const [salesPagination, setSalesPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  
//   // Loading states
//   const [loading, setLoading] = useState({ products: false, sales: false });

//   // Load products and sales on mount
//   useEffect(() => {
//     refreshProducts();
//     refreshSales();
//   }, []);

//   // Debounced search effect
//   useEffect(() => {
//     if (debouncedSearch) {
//       searchProducts(debouncedSearch);
//     } else {
//       refreshProducts();
//     }
//   }, [debouncedSearch]);

//   const refreshProducts = async (page = 1) => {
//     try {
//       setLoading(prev => ({ ...prev, products: true }));
//       const result = await window.posAPI.listProducts(page, 20); // Limit to 20 items
//       setProducts(result.products || result);
//       if (result.pagination) {
//         setProductPagination(result.pagination);
//       }
//     } catch (error) {
//       console.error('Error loading products:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, products: false }));
//     }
//   };

//   const searchProducts = async (query) => {
//     try {
//       setLoading(prev => ({ ...prev, products: true }));
//       const result = await window.posAPI.searchProducts(query, 20);
//       setProducts(result.products || []);
//       if (result.pagination) {
//         setProductPagination(result.pagination);
//       }
//     } catch (error) {
//       console.error('Error searching products:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, products: false }));
//     }
//   };

//   const refreshSales = async (page = 1) => {
//     try {
//       setLoading(prev => ({ ...prev, sales: true }));
//       const result = await window.posAPI.listSales(page, 20); // Limit to 20 items
//       setSales(result.sales || result);
//       if (result.pagination) {
//         setSalesPagination(result.pagination);
//       }
//     } catch (error) {
//       console.error('Error loading sales:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, sales: false }));
//     }
//   };

//   // Memoized product add handler
//   const handleAddProduct = useCallback(async (e) => {
//     e.preventDefault();
//     if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    
//     try {
//       await window.posAPI.addProduct({
//         name: newProduct.name,
//         price: parseFloat(newProduct.price),
//         stock: parseInt(newProduct.stock, 10),
//       });
//       setNewProduct({ name: '', price: '', stock: '' });
//       refreshProducts(1); // Reset to first page
//     } catch (error) {
//       console.error('Error adding product:', error);
//       alert(`Error: ${error.message}`);
//     }
//   }, [newProduct]);

//   // Memoized cart handlers
//   const addToCart = useCallback((product) => {
//     setCart((prev) => {
//       const existing = prev.find((item) => item.id === product.id);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === product.id && item.qty < product.stock
//             ? { ...item, qty: item.qty + 1 }
//             : item
//         );
//       } else {
//         return [...prev, { ...product, qty: 1 }];
//       }
//     });
//   }, []);

//   const removeFromCart = useCallback((id) => {
//     setCart((prev) => prev.filter((item) => item.id !== id));
//   }, []);

//   const updateCartQty = useCallback((id, qty, stock) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, qty: Math.max(1, Math.min(qty, stock)) } : item
//       )
//     );
//   }, []);

//   // Memoized cart total
//   const cartTotal = useMemo(() => {
//     return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
//   }, [cart]);

//   // Memoized checkout handler
//   const handleCheckout = useCallback(async () => {
//     if (cart.length === 0) return;
    
//     try {
//       await window.posAPI.addSale({
//         items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
//         total: cartTotal,
//       });
//       setCart([]);
//       refreshProducts(1);
//       refreshSales(1);
//     } catch (error) {
//       console.error('Error during checkout:', error);
//       alert(`Checkout failed: ${error.message}`);
//     }
//   }, [cart, cartTotal]);

//   // Product change handler
//   const handleProductChange = useCallback((e) => {
//     setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
//   }, [newProduct]);

//   return (
//     <div className="pos-container">
//       <h1>Simple POS System</h1>
      
//       <div className="pos-sections">
//         {/* Product Management */}
//         <section>
//           <h2>Products</h2>
          
//           {/* Search Bar */}
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="search-input"
//             />
//           </div>

//           {/* Add Product Form */}
//           <form onSubmit={handleAddProduct} className="product-form">
//             <input
//               name="name"
//               placeholder="Name"
//               value={newProduct.name}
//               onChange={handleProductChange}
//               required
//             />
//             <input
//               name="price"
//               type="number"
//               step="0.01"
//               placeholder="Price"
//               value={newProduct.price}
//               onChange={handleProductChange}
//               required
//             />
//             <input
//               name="stock"
//               type="number"
//               placeholder="Stock"
//               value={newProduct.stock}
//               onChange={handleProductChange}
//               required
//             />
//             <button type="submit" disabled={loading.products}>
//               {loading.products ? 'Adding...' : 'Add Product'}
//             </button>
//           </form>

//           {/* Products Table */}
//           {loading.products ? (
//             <div className="loading">Loading products...</div>
//           ) : (
//             <>
//               <table className="product-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Price</th>
//                     <th>Stock</th>
//                     <th></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {products.map((p) => (
//                     <tr key={p.id}>
//                       <td>{p.name}</td>
//                       <td>${p.price.toFixed(2)}</td>
//                       <td>{p.stock}</td>
//                       <td>
//                         <button 
//                           onClick={() => addToCart(p)} 
//                           disabled={p.stock === 0}
//                           className="add-to-cart-btn"
//                         >
//                           Add to Cart
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {/* Pagination */}
//               {productPagination.totalPages > 1 && (
//                 <div className="pagination">
//                   <button 
//                     onClick={() => refreshProducts(productPagination.page - 1)}
//                     disabled={productPagination.page <= 1}
//                   >
//                     Previous
//                   </button>
//                   <span>
//                     Page {productPagination.page} of {productPagination.totalPages}
//                   </span>
//                   <button 
//                     onClick={() => refreshProducts(productPagination.page + 1)}
//                     disabled={productPagination.page >= productPagination.totalPages}
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </section>

//         {/* Cart */}
//         <section>
//           <h2>Cart</h2>
//           {cart.length === 0 ? (
//             <p>Cart is empty.</p>
//           ) : (
//             <>
//               <table className="cart-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Price</th>
//                     <th>Qty</th>
//                     <th>Subtotal</th>
//                     <th></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cart.map((item) => (
//                     <tr key={item.id}>
//                       <td>{item.name}</td>
//                       <td>${item.price.toFixed(2)}</td>
//                       <td>
//                         <input
//                           type="number"
//                           min="1"
//                           max={item.stock}
//                           value={item.qty}
//                           onChange={(e) => updateCartQty(item.id, parseInt(e.target.value, 10), item.stock)}
//                           style={{ width: '3em' }}
//                         />
//                       </td>
//                       <td>${(item.price * item.qty).toFixed(2)}</td>
//                       <td>
//                         <button onClick={() => removeFromCart(item.id)} className="remove-btn">
//                           Remove
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <div className="cart-total">
//                 <strong>Total: ${cartTotal.toFixed(2)}</strong>
//               </div>
//               <button onClick={handleCheckout} disabled={cart.length === 0} className="checkout-btn">
//                 Checkout
//               </button>
//             </>
//           )}
//         </section>

//         {/* Sales History */}
//         <section>
//           <h2>Sales History</h2>
//           {loading.sales ? (
//             <div className="loading">Loading sales...</div>
//           ) : sales.length === 0 ? (
//             <p>No sales yet.</p>
//           ) : (
//             <>
//               <table className="sales-table">
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Items</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sales.map((sale) => (
//                     <tr key={sale.id}>
//                       <td>{new Date(sale.created_at).toLocaleString()}</td>
//                       <td>
//                         {sale.items.map((item) => (
//                           <div key={item.id}>
//                             {item.name} x{item.qty} @ ${item.price.toFixed(2)}
//                           </div>
//                         ))}
//                       </td>
//                       <td>${sale.total.toFixed(2)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {/* Sales Pagination */}
//               {salesPagination.totalPages > 1 && (
//                 <div className="pagination">
//                   <button 
//                     onClick={() => refreshSales(salesPagination.page - 1)}
//                     disabled={salesPagination.page <= 1}
//                   >
//                     Previous
//                   </button>
//                   <span>
//                     Page {salesPagination.page} of {salesPagination.totalPages}
//                   </span>
//                   <button 
//                     onClick={() => refreshSales(salesPagination.page + 1)}
//                     disabled={salesPagination.page >= salesPagination.totalPages}
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </section>
//       </div>
//     </div>
//   );
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />    
//       </Routes>
//     </Router>
//   );
// }

// export default App;
