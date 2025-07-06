import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./pos.css";

function POS() {
	const [products, setProducts] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [cart, setCart] = useState({});
	const [paidAmount, setPaidAmount] = useState(0);
	const [change, setChange] = useState(0);
	const location = useLocation();
	const navigate = useNavigate();

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
	const searchProducts = useCallback(async (term) => {
		if (!term.trim()) {
			setFilteredProducts(products);
			return;
		}
		setLoading(true);
		try {
			const result = await window.posAPI.searchProducts(term, 50);
			setFilteredProducts(result.products || []);
		} catch (e) {
			setFilteredProducts([]);
		} finally {
			setLoading(false);
		}
	}, [products]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	useEffect(() => {
		const timer = setTimeout(() => {
			searchProducts(searchTerm);
		}, 400);
		return () => clearTimeout(timer);
	}, [searchTerm, searchProducts]);

	const updateCart = (product, change) => {
		setCart((prev) => {
			const quantity = (prev[product.id]?.quantity || 0) + change;
			if (quantity <= 0) {
				const newCart = { ...prev };
				delete newCart[product.id];
				return newCart;
			}
			// Prevent adding more than stock_quantity
			if (product.stock_quantity !== undefined && quantity > product.stock_quantity) {
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
			fetchProducts();
			alert("Transaction successful!");
		} catch (e) {
			alert("Checkout failed: " + (e.message || e));
		}
	};

	return (
		<div className='pos'>
			<aside className='sidebar'>
				<div className='logo'>Point of Sale</div>
				<button
					className={`nav-btn${location.pathname === '/sales-interface' ? ' active' : ''}`}
					onClick={() => navigate('/sales-interface')}
				>
					🛒 POS
				</button>
				<button
					className={`nav-btn${location.pathname === '/receipt-archive' ? ' active' : ''}`}
					onClick={() => navigate('/receipt-archive')}
				>
					📄 Receipt Archive
				</button>
				<button
					className={`nav-btn${location.pathname === '/product-management' ? ' active' : ''}`}
					onClick={() => navigate('/product-management')}
				>
					📄 Product Management
				</button>
				<button
					className={`nav-btn${location.pathname === '/reports' ? ' active' : ''}`}
					onClick={() => navigate('/reports')}
				>
					📄 Reports
				</button>

			</aside>

			<div className='main'>
				<div className='topbar'>
					<div className='input-fields'>
						<div className='input-group'>
							<label htmlFor='search'>Product Name</label>
							<input
								id='search'
								className='search'
								placeholder='Search by product name'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<div className='cashier-section'>
						<div>
							Cashier: <span className='cashier-name'>John Doe</span>
						</div>
						<button>logout</button>
					</div>
				</div>

				<div className='content'>
					<div className='product-grid'>
						{loading && <div>Loading products...</div>}
						{!loading && filteredProducts.length === 0 && searchTerm && (
							<div>No products found</div>
						)}
						{filteredProducts.map((p) => (
							<div key={p.id} className='product-card'>
								<div>
									<strong>{p.name}</strong>
									<div>Price: ${p.price.toFixed(2)}</div>
									<div>Stock: {p.stock_quantity}</div>
								</div>
								<div className='qty-controls'>
									<button onClick={() => updateCart(p, -1)} disabled={!cart[p.id]}>-</button>
									<span>{cart[p.id]?.quantity || 0}</span>
									<button onClick={() => updateCart(p, 1)} disabled={cart[p.id]?.quantity >= p.stock_quantity}>+</button>
								</div>
							</div>
						))}
					</div>

					<div className='cart-summary'>
						<div className='payment-and-change'>
							<div className='colored-box'>
								Total: <span className='total-value'>${total}</span>
							</div>
							<div className='colored-box'>
								Paid Amount: <span className='payment-value'>${paidAmount.toFixed(2)}</span>
							</div>
							<div className='colored-box'>
								Change: <span className='change-value'>${change.toFixed(2)}</span>
							</div>
						</div>

						<h3>Cart items</h3>

						{/* CART TABLE */}
						<table className='cart-table'>
							<thead>
								<tr>
									<th>No.</th>
									<th>Product Code</th>
									<th>Product Name</th>
									<th>Quantity</th>
									<th>Price</th>
								</tr>
							</thead>
							<tbody>
								{Object.values(cart).map((item, index) => (
									<tr key={item.id}>
										<td>{index + 1}</td>
										<td>{item.id}</td>
										<td>{item.name}</td>
										<td>{item.quantity}</td>
										<td>${(item.price * item.quantity).toFixed(2)}</td>
									</tr>
								))}
							</tbody>
						</table>

						<div>Subtotal: ${subtotal.toFixed(2)}</div>
						<div>Tax: ${tax}</div>
						<div>
							<strong>Total: ${total}</strong>
						</div>
						<div className='pay-buttons'>
							<button onClick={() => handleCheckout("cash")}>Cash</button>
							<button onClick={() => handleCheckout("card")}>Card</button>
							<button onClick={() => handleCheckout("voucher")}>Voucher</button>
						</div>
						<button className='print-btn' disabled>Print Invoice</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default POS;
