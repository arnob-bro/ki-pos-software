import { useEffect, useState, useCallback } from "react";
import {
	Package,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	Search,
	X,
} from "lucide-react";
import "./InventoryManagement.css";
import Sidebar from "../../components/Sidebar";
import LogsTable from "./LogsTable/LogsTable";

const InventoryManagement = () => {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedStockStatus, setSelectedStockStatus] = useState("");
	const [priceRange, setPriceRange] = useState({ min: "", max: "" });
	const [sortBy, setSortBy] = useState("name");
	const [sortOrder, setSortOrder] = useState("asc");

	const [auditLogs, setAuditLogs] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [salesView, setSalesView] = useState("daily");
	const logsPerPage = 10;
	useEffect(() => {
		Promise.all([window.posAPI.getAuditLogs(currentPage, logsPerPage)])
			.then(([audit]) => {
				setAuditLogs(audit.logs);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [salesView, currentPage]);
	console.log(auditLogs);

	useEffect(() => {
		fetchProducts();
		fetchCategories();
	}, []);

	// Fetch products from backend
	const fetchProducts = useCallback(async () => {
		setLoading(true);
		try {
			const result = await window.posAPI.listProducts(1, 50);
			setProducts(result.products || result);
		} catch (e) {
			setProducts([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchCategories = async () => {
		try {
			const result = await window.posAPI.listProductCategories();
			setCategories(result.categories || []);
		} catch (error) {
			console.error("Error fetching categories:", error);
			setCategories([]);
		}
	};

	// Get stock status for filtering
	const getStockStatusValue = (quantity) => {
		if (quantity === 0) return "out-of-stock";
		if (quantity < 10) return "low-stock";
		return "in-stock";
	};

	// Filter and sort products
	const filteredProducts = products
		.filter((product) => {
			const matchesSearch = product.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesCategory =
				selectedCategory === "" ||
				product.category_id.toString() === selectedCategory;
			const matchesStockStatus =
				selectedStockStatus === "" ||
				getStockStatusValue(product.stock_quantity || 0) ===
					selectedStockStatus;

			const productPrice = parseFloat(product.price || 0);
			const matchesPriceRange =
				(priceRange.min === "" || productPrice >= parseFloat(priceRange.min)) &&
				(priceRange.max === "" || productPrice <= parseFloat(priceRange.max));

			return (
				matchesSearch &&
				matchesCategory &&
				matchesStockStatus &&
				matchesPriceRange
			);
		})
		.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			if (sortBy === "category_id") {
				aValue = categories.find((c) => c.id === a.category_id)?.name || "";
				bValue = categories.find((c) => c.id === b.category_id)?.name || "";
			}

			if (typeof aValue === "string") {
				return sortOrder === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
		});

	// Calculate inventory statistics
	const totalProducts = products.length;
	const totalStock = products.reduce(
		(sum, p) => sum + (p.stock_quantity || 0),
		0
	);
	const lowStockProducts = products.filter((p) => (p.stock_quantity || 0) < 10);
	const outOfStockProducts = products.filter(
		(p) => (p.stock_quantity || 0) === 0
	);

	// Mock sales data generation - replace with actual API call when available
	const generateMockSalesData = (products) => {
		return products
			.map((product) => ({
				...product,
				itemsSold: Math.floor(Math.random() * 500) + 10, // Random sales between 10-510
				totalRevenue: 0, // Will be calculated below
			}))
			.map((product) => ({
				...product,
				totalRevenue: product.itemsSold * parseFloat(product.price || 0),
			}));
	};

	// Get top 10 products by sales
	const topProductsSold = generateMockSalesData(products)
		.sort((a, b) => b.totalRevenue - a.totalRevenue)
		.slice(0, 10);

	const getStockStatus = (quantity) => {
		if (quantity === 0)
			return {
				status: "Out of Stock",
				color: "#EF4444",
				class: "out-of-stock",
			};
		if (quantity < 10)
			return { status: "Low Stock", color: "#F59E0B", class: "low-stock" };
		return { status: "In Stock", color: "#10B981", class: "in-stock" };
	};

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedCategory("");
		setSelectedStockStatus("");
		setPriceRange({ min: "", max: "" });
		setSortBy("name");
		setSortOrder("asc");
	};

	const activeFiltersCount = [
		searchTerm,
		selectedCategory,
		selectedStockStatus,
		priceRange.min,
		priceRange.max,
	].filter(Boolean).length;

	return (
		<div className='inventory-management-page'>
			<Sidebar />
			<div className='inventory-management'>
				{/* Header */}
				<div className='inventory-header'>
					<h1>📊 Inventory Management</h1>
					<p>Monitor and manage your product stock levels</p>
				</div>
				{/* Statistics Cards */}
				<div className='stats-grid'>
					<div className='stat-card'>
						<div className='stat-icon'>
							<Package size={24} />
						</div>
						<div className='stat-content'>
							<span className='stat-label'>Total Products</span>
							<span className='stat-value'>{totalProducts}</span>
						</div>
					</div>

					<div className='stat-card'>
						<div className='stat-icon green'>
							<TrendingUp size={24} />
						</div>
						<div className='stat-content'>
							<span className='stat-label'>Total Stock</span>
							<span className='stat-value'>{totalStock}</span>
						</div>
					</div>

					<div className='stat-card'>
						<div className='stat-icon orange'>
							<TrendingDown size={24} />
						</div>
						<div className='stat-content'>
							<span className='stat-label'>Low Stock</span>
							<span className='stat-value'>{lowStockProducts.length}</span>
						</div>
					</div>

					<div className='stat-card'>
						<div className='stat-icon red'>
							<AlertTriangle size={24} />
						</div>
						<div className='stat-content'>
							<span className='stat-label'>Out of Stock</span>
							<span className='stat-value'>{outOfStockProducts.length}</span>
						</div>
					</div>
				</div>
				{/* Top Products Sold Table */}
				<div className='table-card full-width'>
					<div className='table-header'>
						<h3>Top 10 Products Sold</h3>
						<span className='table-count'>Revenue & Sales Performance</span>
					</div>

					<div className='table-container'>
						<table className='top-products-table'>
							<thead>
								<tr>
									<th>Rank</th>
									<th>Product Name</th>
									<th>Category</th>
									<th>Items Sold</th>
									<th>Unit Price</th>
									<th>Total Revenue</th>
									<th>Stock Remaining</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan='7' className='loading-row'>
											<div className='loading-spinner'></div>
											<span>Loading top products...</span>
										</td>
									</tr>
								) : topProductsSold.length === 0 ? (
									<tr>
										<td colSpan='7' className='no-data'>
											No sales data available
										</td>
									</tr>
								) : (
									topProductsSold.map((product, index) => (
										<tr key={product.id}>
											<td>
												<div className='rank-badge'>#{index + 1}</div>
											</td>
											<td>
												<div className='product-name'>{product.name}</div>
											</td>
											<td>
												<div className='category-name'>
													{categories.find((c) => c.id === product.category_id)
														?.name || "N/A"}
												</div>
											</td>
											<td>
												<div className='items-sold'>
													{product.itemsSold?.toLocaleString() || 0}
												</div>
											</td>
											<td>
												<div className='unit-price'>
													${parseFloat(product.price || 0).toFixed(2)}
												</div>
											</td>
											<td>
												<div className='total-revenue'>
													$
													{product.totalRevenue?.toLocaleString("en-US", {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													}) || "0.00"}
												</div>
											</td>
											<td>
												<div className='stock-remaining'>
													{product.stock_quantity || 0}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
				{/* Enhanced Filters Section */}
				<div className='filters-section'>
					{/* Header */}
					<div className='filters-header'>
						<div className='filters-title'>
							<h3>Filter & Search</h3>
							{activeFiltersCount > 0 && (
								<span className='active-filters-badge'>
									{activeFiltersCount} active
								</span>
							)}
						</div>

						{activeFiltersCount > 0 && (
							<div className='filters-controls'>
								<button className='clear-filters-btn' onClick={clearFilters}>
									<X size={16} />
									Clear All
								</button>
							</div>
						)}
					</div>

					{/* Filter Content */}
					<div className='filters-content'>
						{/* Row 1 */}
						<div className='filter-row'>
							{/* Search */}
							<div className='filter-group'>
								<label>Search Products</label>
								<div className='search-input-container'>
									<Search size={18} className='search-icon' />
									<input
										type='text'
										placeholder='Search by product name...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className='search-input'
									/>
									{searchTerm && (
										<button
											className='clear-search-btn'
											onClick={() => setSearchTerm("")}
										>
											<X size={16} />
										</button>
									)}
								</div>
							</div>

							{/* Category */}
							<div className='filter-group'>
								<label>Category</label>
								<div className='select-container'>
									<select
										value={selectedCategory}
										onChange={(e) => setSelectedCategory(e.target.value)}
										className='filter-select'
									>
										<option value=''>All Categories</option>
										{categories.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Stock Status */}
							<div className='filter-group'>
								<label>Stock Status</label>
								<div className='select-container'>
									<select
										value={selectedStockStatus}
										onChange={(e) => setSelectedStockStatus(e.target.value)}
										className='filter-select'
									>
										<option value=''>All Status</option>
										<option value='in-stock'>In Stock</option>
										<option value='low-stock'>Low Stock</option>
										<option value='out-of-stock'>Out of Stock</option>
									</select>
								</div>
							</div>
						</div>

						{/* Row 2 */}
						<div className='filter-row'>
							{/* Price Range */}
							<div className='filter-group'>
								<label>Price Range</label>
								<div className='price-range-container'>
									<div className='price-input-group'>
										<span className='price-label'>Min</span>
										<input
											type='number'
											placeholder='0.00'
											value={priceRange.min}
											onChange={(e) =>
												setPriceRange((prev) => ({
													...prev,
													min: e.target.value,
												}))
											}
											className='price-input'
											min='0'
											step='0.01'
										/>
									</div>
									<span className='price-separator'>to</span>
									<div className='price-input-group'>
										<span className='price-label'>Max</span>
										<input
											type='number'
											placeholder='999.99'
											value={priceRange.max}
											onChange={(e) =>
												setPriceRange((prev) => ({
													...prev,
													max: e.target.value,
												}))
											}
											className='price-input'
											min='0'
											step='0.01'
										/>
									</div>
								</div>
							</div>

							{/* Sort By */}
							<div className='filter-group'>
								<label>Sort By</label>
								<div className='select-container'>
									<select
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
										className='filter-select'
									>
										<option value='name'>Name</option>
										<option value='category_id'>Category</option>
										<option value='stock_quantity'>Stock Quantity</option>
										<option value='price'>Price</option>
									</select>
								</div>
							</div>

							{/* Sort Order */}
							<div className='filter-group'>
								<label>Sort Order</label>
								<div className='select-container'>
									<select
										value={sortOrder}
										onChange={(e) => setSortOrder(e.target.value)}
										className='filter-select'
									>
										<option value='asc'>Ascending</option>
										<option value='desc'>Descending</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Inventory Table */}
				<div className='table-card'>
					<div className='table-header'>
						<h3>Inventory Details</h3>
						<span className='table-count'>{filteredProducts.length} items</span>
					</div>

					<div className='table-container'>
						<table className='inventory-table'>
							<thead>
								<tr>
									<th onClick={() => handleSort("name")}>
										Product Name
										{sortBy === "name" && (
											<span className='sort-indicator'>
												{sortOrder === "asc" ? "↑" : "↓"}
											</span>
										)}
									</th>
									<th onClick={() => handleSort("category_id")}>
										Category
										{sortBy === "category_id" && (
											<span className='sort-indicator'>
												{sortOrder === "asc" ? "↑" : "↓"}
											</span>
										)}
									</th>
									<th className='hide-mobile'>Barcode</th>
									<th onClick={() => handleSort("stock_quantity")}>
										Stock
										{sortBy === "stock_quantity" && (
											<span className='sort-indicator'>
												{sortOrder === "asc" ? "↑" : "↓"}
											</span>
										)}
									</th>
									<th
										className='hide-mobile'
										onClick={() => handleSort("price")}
									>
										Unit Price
										{sortBy === "price" && (
											<span className='sort-indicator'>
												{sortOrder === "asc" ? "↑" : "↓"}
											</span>
										)}
									</th>
									<th className='hide-mobile'>Stock Value</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan='7' className='loading-row'>
											<div className='loading-spinner'></div>
											<span>Loading...</span>
										</td>
									</tr>
								) : filteredProducts.length === 0 ? (
									<tr>
										<td colSpan='7' className='no-data'>
											No products found
										</td>
									</tr>
								) : (
									filteredProducts.map((product) => {
										const stockStatus = getStockStatus(
											product.stock_quantity || 0
										);
										const stockValue =
											(product.stock_quantity || 0) *
											parseFloat(product.price || 0);

										return (
											<tr key={product.id}>
												<td>
													<div className='product-name'>{product.name}</div>
												</td>
												<td>
													<div className='category-name'>
														{categories.find(
															(c) => c.id === product.category_id
														)?.name || "N/A"}
													</div>
												</td>
												<td className='hide-mobile'>
													{product.barcode || "N/A"}
												</td>
												<td>
													<div className='stock-quantity'>
														{product.stock_quantity || 0}
													</div>
												</td>
												<td className='hide-mobile'>
													${parseFloat(product.price || 0).toFixed(2)}
												</td>
												<td className='hide-mobile'>
													${stockValue.toFixed(2)}
												</td>
												<td>
													<span className={`status-badge ${stockStatus.class}`}>
														{stockStatus.status}
													</span>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
				<LogsTable auditLogs={auditLogs} />;
			</div>
		</div>
	);
};

export default InventoryManagement;
