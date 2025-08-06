// ki-pos-software\renderer\src\pages\CustomerManagement\CustomerManagement.jsx	
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import useUserStore from "../../stores/userStore";
import "./customerManagement.css";

const defaultCustomer = {
	id: null,
	name: "",
	phone: "",
	email: "",
	address: "",
	loyalty_points: 0,
	loyalty_tier: "",
};

const LOYALTY_TIERS = ["Silver", "Gold", "Platinum"];

function Modal({ open, onClose, children }) {
	if (!open) return null;
	return (
		<div className='modal-overlay'>
			<div className='modal-content'>
				<button className='modal-close' onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	);
}

export default function CustomerManagement() {
	const [customers, setCustomers] = useState([]);
	const [searchName, setSearchName] = useState("");
	const [searchEmail, setSearchEmail] = useState("");
	const [searchPoints, setSearchPoints] = useState("");
	const [searchTier, setSearchTier] = useState("");
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [formCustomer, setFormCustomer] = useState(defaultCustomer);
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [modalMode, setModalMode] = useState("add"); // or "edit"
	const currentUser = useUserStore((s) => s.user);
	const canDelete = currentUser && currentUser.role_id === 1;
	const [showSidebar, setShowSidebar] = useState(false);
	const [sortBy, setSortBy] = useState(null);
	const [sortOrder, setSortOrder] = useState("asc");

	useEffect(() => {
		fetchCustomers();
	}, []);

	async function fetchCustomers() {
		setLoading(true);
		setError("");
		try {
			const result = await window.posAPI.listCustomers(1, 100);
			setCustomers(result.customers || []);
		} catch (e) {
			setError("Failed to fetch customers");
		} finally {
			setLoading(false);
		}
	}

	async function fetchHistory(customerId) {
		setLoading(true);
		setError("");
		try {
			const result = await window.posAPI.getCustomerHistory(customerId);
			setHistory(result);
		} catch (e) {
			setError("Failed to fetch purchase history");
		} finally {
			setLoading(false);
		}
	}

	function handleSelectCustomer(customer) {
		setSelectedCustomer(customer);
		setShowSidebar(true);
		fetchHistory(customer.id);
	}

	function handleAddEdit(customer = null) {
		setModalMode(customer ? "edit" : "add");
		setShowForm(true);
		setFormCustomer(customer ? { ...customer } : { ...defaultCustomer });
	}

	function handleFormChange(e) {
		const { name, value } = e.target;
		setFormCustomer((prev) => ({ ...prev, [name]: value }));
	}

	async function handleFormSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			if (modalMode === "edit") {
				await window.posAPI.updateCustomer(formCustomer, currentUser);
			} else {
				await window.posAPI.addCustomer(formCustomer, currentUser);
			}
			setShowForm(false);
			fetchCustomers();
		} catch (e) {
			// Check for duplicate phone error
			if (e.message && e.message.includes("phone number already exists")) {
				setError("A customer with this phone number already exists.");
			} else {
				setError("Failed to save customer");
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleDeleteCustomer(customer) {
		if (!window.confirm("Are you sure you want to delete this customer?"))
			return;
		setLoading(true);
		setError("");
		try {
			await window.posAPI.deleteCustomer(customer.id, currentUser);
			setSelectedCustomer(null);
			fetchCustomers();
		} catch (e) {
			setError(`Failed to delete customer, error : ${e}`);
		} finally {
			setLoading(false);
		}
	}

	async function handleAssignLoyaltyTier(id, tier) {
		setLoading(true);
		setError("");
		try {
			await window.posAPI.assignLoyaltyTier(id, tier, currentUser);
			fetchCustomers();
		} catch (e) {
			setError("Failed to assign loyalty tier");
		} finally {
			setLoading(false);
		}
	}

	// Sorting logic
	function handleSort(field) {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	}

	// Filtering logic for table
	let filteredCustomers = customers.filter((c) => {
		let match = true;
		if (searchName && !c.name.toLowerCase().includes(searchName.toLowerCase()))
			match = false;
		if (
			searchEmail &&
			(!c.email || !c.email.toLowerCase().includes(searchEmail.toLowerCase()))
		)
			match = false;
		if (searchPoints && String(c.loyalty_points) !== String(searchPoints))
			match = false;
		if (
			searchTier &&
			(!c.loyalty_tier ||
				c.loyalty_tier.toLowerCase() !== searchTier.toLowerCase())
		)
			match = false;
		return match;
	});
	// Apply sorting
	if (sortBy) {
		filteredCustomers = [...filteredCustomers].sort((a, b) => {
			if (sortBy === "name") {
				if (a.name.toLowerCase() < b.name.toLowerCase())
					return sortOrder === "asc" ? -1 : 1;
				if (a.name.toLowerCase() > b.name.toLowerCase())
					return sortOrder === "asc" ? 1 : -1;
				return 0;
			}
			if (sortBy === "loyalty_points") {
				return sortOrder === "asc"
					? Number(a.loyalty_points) - Number(b.loyalty_points)
					: Number(b.loyalty_points) - Number(a.loyalty_points);
			}
			return 0;
		});
	}

	return (
		<div className='customer-management-page'>
			<Sidebar />
			<div className='customer-management-main'>
				<div className='customer-topbar'>
					<h1>Customer Management</h1>
				</div>
				<div className='customer-search-bar'>
					<input
						type='text'
						placeholder='Search by name...'
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						className='customer-search-input'
					/>
					<input
						type='text'
						placeholder='Search by email...'
						value={searchEmail}
						onChange={(e) => setSearchEmail(e.target.value)}
						className='customer-search-input'
					/>
					<input
						type='number'
						placeholder='Search by loyalty points...'
						value={searchPoints}
						onChange={(e) => setSearchPoints(e.target.value)}
						className='customer-search-input'
						min='0'
					/>
					<select
						value={searchTier}
						onChange={(e) => setSearchTier(e.target.value)}
						className='customer-search-input'
					>
						<option value=''>All Tiers</option>
						{LOYALTY_TIERS.map((tier) => (
							<option key={tier} value={tier}>
								{tier}
							</option>
						))}
					</select>
					<button onClick={() => handleAddEdit()} className='add-customer-btn'>
						+ Add Customer
					</button>
				</div>
				{loading && <div className='loading'>Loading...</div>}
				{error && <div className='form-error'>{error}</div>}
				<div className='customer-table-container'>
					<table className='customer-table'>
						<thead>
							<tr>
								<th>
									Name
									<button
										className={`sort-btn${sortBy === "name" ? " active" : ""}`}
										onClick={() => handleSort("name")}
										title={`Sort by name (${
											sortOrder === "asc" && sortBy === "name" ? "A-Z" : "Z-A"
										})`}
									>
										{sortBy === "name"
											? sortOrder === "asc"
												? "▲"
												: "▼"
											: "↕"}
									</button>
								</th>
								<th>Phone</th>
								<th>Email</th>
								<th>Address</th>
								<th>
									Loyalty Points
									<button
										className={`sort-btn${
											sortBy === "loyalty_points" ? " active" : ""
										}`}
										onClick={() => handleSort("loyalty_points")}
										title={`Sort by points (${
											sortOrder === "asc" && sortBy === "loyalty_points"
												? "Low-High"
												: "High-Low"
										})`}
									>
										{sortBy === "loyalty_points"
											? sortOrder === "asc"
												? "▲"
												: "▼"
											: "↕"}
									</button>
								</th>
								<th>Loyalty Tier</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredCustomers.length === 0 ? (
								<tr>
									<td colSpan={7} className='empty-state'>
										No customers found.
									</td>
								</tr>
							) : (
								filteredCustomers.map((customer) => (
									<tr
										key={customer.id}
										className={
											selectedCustomer && selectedCustomer.id === customer.id
												? "selected-row"
												: ""
										}
										// Remove onClick from row
										style={{ cursor: "default" }}
									>
										<td>{customer.name}</td>
										<td>{customer.phone}</td>
										<td>{customer.email}</td>
										<td>{customer.address}</td>
										<td>{customer.loyalty_points}</td>
										<td>
											{customer.loyalty_tier && (
												<span
													className={`tier-badge tier-${customer.loyalty_tier.toLowerCase()}`}
												>
													{customer.loyalty_tier}
												</span>
											)}
										</td>
										<td>
											<button
												className='view-btn'
												onClick={(e) => {
													e.stopPropagation();
													handleSelectCustomer(customer);
												}}
											>
												View
											</button>
											<button
												className='edit-btn'
												onClick={(e) => {
													e.stopPropagation();
													handleAddEdit(customer);
												}}
											>
												Edit
											</button>
											{canDelete && (
												<button
													className='delete-btn'
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteCustomer(customer);
													}}
												>
													Delete
												</button>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
			{/* Customer Info/History Sidebar */}
			<div className={`customer-info-sidebar${showSidebar ? " open" : ""}`}>
				{selectedCustomer && (
					<>
						<button
							className='close-sidebar-btn'
							onClick={() => {
								setShowSidebar(false);
								setSelectedCustomer(null);
							}}
						>
							&times;
						</button>
						<div className='sidebar-header'>
							<h2>{selectedCustomer.name}</h2>
							{selectedCustomer.loyalty_tier && (
								<span
									className={`tier-badge tier-${selectedCustomer.loyalty_tier.toLowerCase()}`}
								>
									{selectedCustomer.loyalty_tier}
								</span>
							)}
						</div>
						<div className='sidebar-info-grid'>
							<div className='sidebar-info-item'>
								<span className='sidebar-info-label'>Phone:</span>
								<span className='sidebar-info-value'>
									{selectedCustomer.phone}
								</span>
							</div>
							<div className='sidebar-info-item'>
								<span className='sidebar-info-label'>Email:</span>
								<span className='sidebar-info-value'>
									{selectedCustomer.email}
								</span>
							</div>
							<div className='sidebar-info-item'>
								<span className='sidebar-info-label'>Address:</span>
								<span className='sidebar-info-value'>
									{selectedCustomer.address}
								</span>
							</div>
							<div className='sidebar-info-item'>
								<span className='sidebar-info-label'>Loyalty Points:</span>
								<span className='sidebar-info-value points'>
									{selectedCustomer.loyalty_points}
								</span>
							</div>
							<div className='sidebar-info-item'>
								<span className='sidebar-info-label'>Loyalty Tier:</span>
								<span className='sidebar-info-value'>
									{LOYALTY_TIERS.map((tier) => (
										<button
											key={tier}
											className={`tier-btn${
												selectedCustomer.loyalty_tier === tier ? " active" : ""
											}`}
											onClick={() =>
												handleAssignLoyaltyTier(selectedCustomer.id, tier)
											}
											disabled={
												loading || selectedCustomer.loyalty_tier === tier
											}
										>
											{tier}
										</button>
									))}
								</span>
							</div>
						</div>
						<h3 className='sidebar-history-title'>Purchase History</h3>
						<div className='sidebar-history-list'>
							{history.length === 0 ? (
								<div className='sidebar-history-empty'>No purchases found.</div>
							) : (
								history.map((tx) => (
									<div key={tx.id} className='sidebar-history-item'>
										<div>
											<b>Date:</b> {tx.timestamp?.split("T")[0] || tx.timestamp}
										</div>
										<div>
											<b>Total:</b> ${tx.total_amount?.toFixed(2) || "-"}
										</div>
										<div>
											<b>Payment:</b> {tx.payment_method}
										</div>
										<div>
											<b>Items:</b>
											<ul>
												{tx.items.map((item, idx) => (
													<li key={idx}>
														{item.product_name} x{item.quantity} @ $
														{item.unit_price}
													</li>
												))}
											</ul>
										</div>
									</div>
								))
							)}
						</div>
					</>
				)}
			</div>
			{/* Add/Edit Customer Modal */}
			<Modal open={showForm} onClose={() => setShowForm(false)}>
				<form className='customer-form' onSubmit={handleFormSubmit}>
					<h2>{modalMode === "edit" ? "Edit Customer" : "Add Customer"}</h2>
					<label>
						Name:
						<input
							name='name'
							value={formCustomer.name}
							onChange={handleFormChange}
							required
						/>
					</label>
					<label>
						Phone:
						<input
							name='phone'
							value={formCustomer.phone}
							onChange={handleFormChange}
						/>
					</label>
					<label>
						Email:
						<input
							name='email'
							value={formCustomer.email}
							onChange={handleFormChange}
						/>
					</label>
					<label>
						Address:
						<input
							name='address'
							value={formCustomer.address}
							onChange={handleFormChange}
						/>
					</label>
					<label>
						Loyalty Points:
						<input
							name='loyalty_points'
							type='number'
							value={formCustomer.loyalty_points}
							onChange={handleFormChange}
							min='0'
						/>
					</label>
					<label>
						Loyalty Tier:
						<select
							name='loyalty_tier'
							value={formCustomer.loyalty_tier || ""}
							onChange={handleFormChange}
						>
							<option value=''>Select Tier</option>
							{LOYALTY_TIERS.map((tier) => (
								<option key={tier} value={tier}>
									{tier}
								</option>
							))}
						</select>
					</label>
					<div className='form-actions'>
						<button type='submit' disabled={loading}>
							{modalMode === "edit" ? "Update" : "Add"}
						</button>
						<button
							type='button'
							onClick={() => setShowForm(false)}
							disabled={loading}
						>
							Cancel
						</button>
					</div>
					{error && <div className='form-error'>{error}</div>}
				</form>
			</Modal>
		</div>
	);
}
