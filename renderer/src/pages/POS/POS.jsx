import "./pos.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function POS() {
	const [products, setProducts] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [barcodeSearch, setBarcodeSearch] = useState("");
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [cart, setCart] = useState({});
	const [paidAmount, setPaidAmount] = useState(0);
	const [change, setChange] = useState(0);
	const location = useLocation();
	const navigate = useNavigate();
	const [selectedProducts, setSelectedProducts] = useState([]); // Array of selected products to show in the product-area
	const [showDropdown, setShowDropdown] = useState(false);
	const searchInputRef = useRef(null);
	const debounceTimeout = useRef();
	const [queue, setQueue] = useState([]); // Array of carts (currently selected items)
	const [showQueueDropdown, setShowQueueDropdown] = useState(false);

	// Fetch products from backend
	const fetchProducts = useCallback(async () => {
		setLoading(true);
		try {
			const result = await window.posAPI.listProducts(1, 50);
			setProducts(result.products || result);
			setFilteredProducts(result.products || result);
		} catch (e) {
			setProducts([]);
			setFilteredProducts([]);
		} finally {
			setLoading(false);
		}
	}, []);

	// Search products from backend
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	// debounce for search
	useEffect(() => {
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}
		
		if (!searchTerm.trim()) {
			setFilteredProducts(products);
			setShowDropdown(false);
			setLoading(false);
			return;
		}
		
		// Set loading state for search
		setLoading(true);
		
		// Don't show dropdown immediately - wait for search results
		debounceTimeout.current = setTimeout(async () => {
			try {
				const result = await window.posAPI.searchProducts(searchTerm, 50);
				const searchResults = result.products || [];
				setFilteredProducts(searchResults);
				// Only show dropdown if we have results and search term still exists
				setShowDropdown(searchResults.length > 0 && searchTerm.trim().length > 0);
			} catch (e) {
				setFilteredProducts([]);
				setShowDropdown(false);
			} finally {
				setLoading(false);
			}
		}, 300); // debounce time is 300 here
		
		return () => {
			if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
		};
	}, [searchTerm, products]);

	// Hide dropdown on outside click
	useEffect(() => {
		function handleClickOutside(event) {
			if (
				searchInputRef.current &&
				!searchInputRef.current.contains(event.target)
			) {
				setShowDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const updateCart = (product, change) => {
		setCart((prev) => {
			const quantity = (prev[product.id]?.quantity || 0) + change;
			if (quantity <= 0) {
				const newCart = { ...prev };
				delete newCart[product.id];
				return newCart;
			}
			// Prevent adding more than stock_quantity
			if (
				product.stock_quantity !== undefined &&
				quantity > product.stock_quantity
			) {
				return prev;
			}
			return {
				...prev,
				[product.id]: { ...product, quantity },
			};
		});
	};

	const subtotal = Object.values(cart).reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const tax = +(subtotal * 0.05).toFixed(2);
	const total = +(subtotal + tax).toFixed(2);

	useEffect(() => {
		setChange(Math.max(0, paidAmount - total));
	}, [paidAmount, total]);

	const handleCheckout = async (payment_method = "cash") => {
		if (Object.keys(cart).length === 0) return;
		try {
			await window.posAPI.addTransaction({
				user_id: "user-1", // TODO: Replace with real user context
				payment_method,
				total_amount: total,
				vat_amount: tax,
				discount_amount: 0,
				items: Object.values(cart).map((item) => ({
					product_id: item.id,
					quantity: item.quantity,
					unit_price: item.price,
					vat_amount: 0,
					discount_applied: 0,
				})),
			});
			setCart({});
			setPaidAmount(0);
			setChange(0);
			setSelectedProducts([]); // Clear selected products after checkout
			fetchProducts();
			alert("Transaction successful!");
		} catch (e) {
			alert("Checkout failed: " + (e.message || e));
		}
	};

	// Add to queue handler
	const handleAddToQueue = () => {
		if (Object.keys(cart).length === 0) return;
		setQueue((prev) => [...prev, { cart, paidAmount, change, timestamp: Date.now() }]);
		setCart({});
		setPaidAmount(0);
		setChange(0);
		setSelectedProducts([]); // Clear selected products when adding to queue
	};

	// Load cart from queue
	const handleLoadQueuedCart = (idx) => {
		const queued = queue[idx];
		if (!queued) return;
		setCart(queued.cart);
		setPaidAmount(queued.paidAmount);
		setChange(queued.change);
		// Restore selected products from cart items
		const cartProducts = Object.values(queued.cart).map(item => ({
			id: item.id,
			name: item.name,
			price: item.price,
			stock_quantity: item.stock_quantity
		}));
		setSelectedProducts(cartProducts);
		setQueue((prev) => prev.filter((_, i) => i !== idx));
		setShowQueueDropdown(false);
	};

	// WHen clicked on PRINT - reset cart and selected products.
	const handlePrintInvoice = () => {
		// Clear current cart and selected products
		setCart({});
		setPaidAmount(0);
		setChange(0);
		setSelectedProducts([]);
		setSearchTerm("");
		setBarcodeSearch("");
		setShowDropdown(false);
		setShowQueueDropdown(false);
		// Refresh products
		fetchProducts();
	};

	return (
		<div className='pos'>
			<aside className='sidebar'>
				<div className='logo'>Point of Sale</div>
				<button
					className={`nav-btn${
						location.pathname === "/sales-interface" ? " active" : ""
					}`}
					onClick={() => navigate("/sales-interface")}
				>
					🛒 POS
				</button>
				<button
					className={`nav-btn${
						location.pathname === "/receipt-archive" ? " active" : ""
					}`}
					onClick={() => navigate("/receipt-archive")}
				>
					📄 Receipt Archive
				</button>
				<button
					className={`nav-btn${
						location.pathname === "/product-management" ? " active" : ""
					}`}
					onClick={() => navigate("/product-management")}
				>
					📄 Product Management
				</button>
			</aside>

			<div className='main'>
				<div className='topbar'>
					<div className='input-fields'>

					<div className='input-group' ref={searchInputRef} style={{ position: 'relative' }}>
							<label htmlFor='search'>Product</label>
							<input
								id='search'
								className='search'
								placeholder='Search product'
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									// Don't show dropdown immediately - let the debounced search handle it
								}}
								autoComplete='off'
							/>
							{showDropdown && searchTerm.trim() && (
								<ul className='product-dropdown'>
									{loading ? (
										<li className='dropdown-item' style={{ color: '#888', textAlign: 'center' }}>
											Searching...
										</li>
									) : filteredProducts.length > 0 ? (
										filteredProducts.map((p) => (
											<li
												key={p.id}
												className='dropdown-item'
																							onClick={() => {
												// Add product to selected products if not already selected
												setSelectedProducts(prev => {
													const exists = prev.find(product => product.id === p.id);
													if (exists) return prev; // Don't add duplicates
													return [...prev, p];
												});
												setShowDropdown(false);
												setSearchTerm(''); // Clear search term after selection
											}}
											>
												{p.name} <span style={{ color: '#888', fontSize: '0.9em' }}>({p.id})</span>
											</li>
										))
									) : (
										<li className='dropdown-item' style={{ color: '#888', textAlign: 'center' }}>
											No products found
										</li>
									)}
								</ul>
							)}
						
						<div className='input-group'>
							<label htmlFor='barcode-search'>Barcode</label>
							<input
								id='barcode-search'
								className='search'
								placeholder='Scan barcode'
								value={barcodeSearch}
								onChange={(e) => setBarcodeSearch(e.target.value)}
							/>
						</div>

						
						</div>

						
					</div>
					<div className='cashier-section'>
						<div>
							Cashier: <span className='cashier-name'>John Doe</span>
						</div>
						{/* Queue Button */}
						<div style={{ position: 'relative' }}>
							<button
								className='queue-btn'
								onClick={() => setShowQueueDropdown((v) => !v)}
								style={{ position: 'relative', marginLeft: 10 }}
							>
								Queue <span style={{ background: '#222', color: '#fff', borderRadius: '50%', padding: '2px 8px', marginLeft: 4, fontSize: '0.9em' }}>{queue.length}</span>
							</button>
							{showQueueDropdown && (
								<div
									className='queue-dropdown'
									style={{
										position: 'absolute',
										top: '120%',
										right: 0,
										background: '#fff',
										boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
										borderRadius: 8,
										zIndex: 100,
										minWidth: 260,
										padding: 8,
									}}
								>
									{queue.length === 0 && (
										<div style={{ color: '#888', textAlign: 'center', padding: 12 }}>No carts in queue</div>
									)}
									{queue.map((q, idx) => (
										<div
											key={q.timestamp}
											className='queue-card'
											style={{
												border: '1px solid #ddd',
												borderRadius: 6,
												padding: 10,
												marginBottom: 8,
												background: '#f9f9f9',
												cursor: 'pointer',
											}}
											onClick={() => handleLoadQueuedCart(idx)}
										>
											<div style={{ fontWeight: 'bold', fontSize: '1em' }}>
												Cart #{idx + 1} - {Object.values(q.cart).reduce((sum, item) => sum + item.quantity, 0)} items
											</div>
											<div style={{ fontSize: '0.95em', color: '#555' }}>
												{Object.values(q.cart)[0]?.name || 'No items'}
											</div>
											<div style={{ fontSize: '0.9em', color: '#888' }}>
												Total: ${Object.values(q.cart).reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
											</div>
											<div style={{ fontSize: '0.85em', color: '#aaa' }}>
												{new Date(q.timestamp).toLocaleTimeString()}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
						<button className="logout-btn">logout</button>
					</div>
				</div>

				<div className='content'>
					<div className='product-grid'>
						{loading && <div>Loading products...</div>}
						{!loading && selectedProducts.length === 0 && (
							<div style={{ color: '#888', textAlign: 'center', marginTop: '2em' }}>
								Please search and select products to display.
							</div>
						)}
						{selectedProducts.length > 0 && (
							<table className='product-table'>
								<thead>
									<tr>
										<th>ID</th>
										<th>Name</th>
										<th>Category ID</th>
										<th>Barcode</th>
										<th>Price</th>
										<th>VAT Rate</th>
										<th>Stock</th>
										<th>Quantity</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{selectedProducts.map((product) => (
										<tr key={product.id}>
											<td>{product.id}</td>
											<td>{product.name}</td>
											<td>{product.category_id}</td>
											<td>{product.barcode}</td>
											<td>${product.price.toFixed(2)}</td>
											<td>{product.vat_rate}%</td>
											<td>{product.stock_quantity}</td>
											<td>
												<div className='qty-controls'>
													<button
														onClick={() => updateCart(product, -1)}
														disabled={!cart[product.id]}
													>
														-
													</button>
													<span>{cart[product.id]?.quantity || 0}</span>
													<button
														onClick={() => updateCart(product, 1)}
														disabled={cart[product.id]?.quantity >= product.stock_quantity}
													>
														+
													</button>
												</div>
											</td>
											<td>
												<button 
													onClick={() => {
														setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
													}}
													style={{
														background: '#ff4444',
														color: 'white',
														border: 'none',
														borderRadius: '4px',
														padding: '4px 8px',
														cursor: 'pointer',
														fontSize: '12px'
													}}
												>
													Remove
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					<div className='cart-summary'>
						<div className='receipt-content'>
							<div className='receipt-style'>
								{/* Receipt Header */}
								<div style={{ textAlign: 'center', marginBottom: '10px' }}>
									<div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Supermarket XYZ</div>
									<div>Tel: 123-456-7890</div>
									<div style={{ fontSize: '0.95em', marginTop: '4px' }}>
										{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
									</div>
								</div>

								<hr style={{ margin: '10px 0' }} />

								{/* Cart Items */}
								<div style={{ fontFamily: 'monospace', fontSize: '1em', marginBottom: '10px' }}>
									{Object.values(cart).length === 0 && (
										<div style={{ color: '#888', textAlign: 'center' }}>No items in cart</div>
									)}
									{Object.values(cart).map((item, idx) => (
										<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
											<span>{item.quantity} x {item.name}</span>
											<span>${(item.price * item.quantity).toFixed(2)}</span>
										</div>
									))}
								</div>

								<hr style={{ margin: '10px 0' }} />

								{/* Totals */}
								<div style={{ fontFamily: 'monospace', fontSize: '1em' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span>Subtotal:</span>
										<span>${subtotal.toFixed(2)}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span>Tax:</span>
										<span>${tax}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
										<span>Total:</span>
										<span>${total}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span>Paid:</span>
										<span>${paidAmount.toFixed(2)}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span>Change:</span>
										<span>${change.toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="payment-section">
							<div className="add-to-queue-pay-btns">

								<div className="transaction-amount-section">
									{/* // TODO : PORE KORTE HOBE */}
								</div>

								<div className='pay-buttons'>
									<button onClick={() => handleCheckout("cash")}>Cash</button>
									<button onClick={() => handleCheckout("card")}>Card</button>
									<button onClick={() => handleCheckout("voucher")}>Voucher</button>
								</div>

								<div className="add-to-queue-print-btns">
									<button className="add-to-queue" onClick={handleAddToQueue} style={{ marginTop: 8, marginBottom: 8 }}>
										Add to queue
									</button>
									<button className='print-btn' onClick={handlePrintInvoice}>
										Print Invoice
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default POS;
