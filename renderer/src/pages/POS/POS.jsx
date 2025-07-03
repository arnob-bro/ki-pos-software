import "./pos.css";
import { useState, useEffect } from "react";

const PRODUCTS = [
	{ id: 1, name: "Bread", price: 2.0 },
	{ id: 2, name: "Apples", price: 5.0 },
	{ id: 3, name: "Orange Juice", price: 6.0 },
	{ id: 4, name: "Detergent", price: 9.0 },
	{ id: 5, name: "Milk", price: 3.5 },
	{ id: 6, name: "Eggs (dozen)", price: 4.0 },
	{ id: 7, name: "Butter", price: 2.5 },
	{ id: 8, name: "Cheddar Cheese", price: 4.5 },
	{ id: 9, name: "Bananas", price: 3.0 },
	{ id: 10, name: "Tomatoes", price: 2.5 },
	{ id: 11, name: "Potatoes (5kg)", price: 7.0 },
	{ id: 12, name: "Onions (1kg)", price: 2.0 },
	{ id: 13, name: "Carrots (1kg)", price: 2.0 },
	{ id: 14, name: "Chicken Breast (1kg)", price: 8.0 },
	{ id: 15, name: "Ground Beef (1kg)", price: 10.0 },
	{ id: 16, name: "Rice (5kg)", price: 12.0 },
	{ id: 17, name: "Pasta", price: 2.0 },
	{ id: 18, name: "Tomato Sauce", price: 1.5 },
	{ id: 19, name: "Canned Tuna", price: 2.0 },
	{ id: 20, name: "Cooking Oil (1L)", price: 5.0 },
	{ id: 21, name: "Salt (1kg)", price: 1.0 },
	{ id: 22, name: "Black Pepper", price: 1.5 },
	{ id: 23, name: "Sugar (1kg)", price: 2.0 },
	{ id: 24, name: "Flour (1kg)", price: 2.5 },
	{ id: 25, name: "Yogurt", price: 3.0 },
	{ id: 26, name: "Cereal", price: 4.0 },
	{ id: 27, name: "Biscuits", price: 1.5 },
	{ id: 28, name: "Chocolate Bar", price: 1.0 },
	{ id: 29, name: "Chips", price: 2.0 },
	{ id: 30, name: "Soda (2L)", price: 3.0 },
	{ id: 31, name: "Coffee (200g)", price: 6.0 },
	{ id: 32, name: "Tea (100 bags)", price: 5.0 },
	{ id: 33, name: "Honey (500g)", price: 7.0 },
	{ id: 34, name: "Jam", price: 3.0 },
	{ id: 35, name: "Peanut Butter", price: 4.0 },
	{ id: 36, name: "Frozen Peas", price: 3.0 },
	{ id: 37, name: "Frozen Pizza", price: 5.0 },
	{ id: 38, name: "Ice Cream", price: 4.5 },
	{ id: 39, name: "Shampoo", price: 5.0 },
	{ id: 40, name: "Toothpaste", price: 2.5 },
	{ id: 41, name: "Toilet Paper (pack)", price: 6.0 },
	{ id: 42, name: "Soap Bar", price: 1.0 },
	{ id: 43, name: "Hand Sanitizer", price: 3.0 },
	{ id: 44, name: "Bleach", price: 3.5 },
	{ id: 45, name: "Glass Cleaner", price: 4.0 },
	{ id: 46, name: "Sponges (pack)", price: 2.0 },
	{ id: 47, name: "Aluminum Foil", price: 3.0 },
	{ id: 48, name: "Cling Wrap", price: 2.5 },
	{ id: 49, name: "Paper Towels", price: 4.0 },
	{ id: 50, name: "Trash Bags (pack)", price: 5.0 },
];

function POS() {
	const [cart, setCart] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [loading, setLoading] = useState(false);

	const updateCart = (product, change) => {
		setCart((prev) => {
			const quantity = (prev[product.id]?.quantity || 0) + change;
			if (quantity <= 0) {
				const newCart = { ...prev };
				delete newCart[product.id];
				return newCart;
			}
			return {
				...prev,
				[product.id]: { ...product, quantity },
			};
		});
	};

	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredProducts([]);
			return;
		}

		setLoading(true);
		const timer = setTimeout(() => {
			const results = PRODUCTS.filter((p) =>
				p.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredProducts(results);
			setLoading(false);
		}, 500); // simulate server delay

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const subtotal = Object.values(cart).reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const tax = +(subtotal * 0.05).toFixed(2);
	const total = +(subtotal + tax).toFixed(2);

	return (
		<div className='pos'>
			<aside className='sidebar'>
				<div className='logo'>Point of Sale</div>
				<button className='nav-btn active'>🛒 POS</button>
				<button className='nav-btn'>📄 Receipt Archive</button>
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
								</div>
								<div className='qty-controls'>
									<button onClick={() => updateCart(p, -1)}>-</button>
									<span>{cart[p.id]?.quantity || 0}</span>
									<button onClick={() => updateCart(p, 1)}>+</button>
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
								Paid Amount: <span className='payment-value'>$0.00</span>
							</div>
							<div className='colored-box'>
								Change: <span className='change-value'>$0.00</span>
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
							<button>Cash</button>
							<button>Card</button>
							<button>Voucher</button>
						</div>
						<button className='print-btn'>Print Invoice</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default POS;
