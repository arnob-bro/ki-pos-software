import React, { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Search, X } from "lucide-react";
import "./InventoryManagement.css";
import Sidebar from "../../components/Sidebar";
import useLanguageStore from '../../stores/languageStore';

const InventoryManagement = () => {
  const language = useLanguageStore((state) => state.language);
  const t = (en, de) => language === 'de' ? de : en;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStockStatus, setSelectedStockStatus] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

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
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Get stock status for filtering
  const getStockStatusValue = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "" || product.category_id.toString() === selectedCategory;
      const matchesStockStatus = selectedStockStatus === "" || getStockStatusValue(product.stock_quantity || 0) === selectedStockStatus;
      
      const productPrice = parseFloat(product.price || 0);
      const matchesPriceRange = (priceRange.min === "" || productPrice >= parseFloat(priceRange.min)) &&
                               (priceRange.max === "" || productPrice <= parseFloat(priceRange.max));
      
      return matchesSearch && matchesCategory && matchesStockStatus && matchesPriceRange;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "category_id") {
        aValue = categories.find(c => c.id === a.category_id)?.name || "";
        bValue = categories.find(c => c.id === b.category_id)?.name || "";
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  // Calculate inventory statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock_quantity || 0) < 10);
  const outOfStockProducts = products.filter(p => (p.stock_quantity || 0) === 0);

  // Prepare data for charts
  const stockByCategory = categories.map(category => {
    const categoryProducts = products.filter(p => p.category_id === category.id);
    const totalCategoryStock = categoryProducts.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
    return {
      name: category.name,
      stock: totalCategoryStock,
      products: categoryProducts.length
    };
  }).filter(item => item.stock > 0);

  const stockLevels = [
    { name: 'In Stock', value: products.filter(p => (p.stock_quantity || 0) > 10).length, color: '#10B981' },
    { name: 'Low Stock', value: lowStockProducts.length, color: '#F59E0B' },
    { name: 'Out of Stock', value: outOfStockProducts.length, color: '#EF4444' }
  ];

  const topStockProducts = products
    .sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
    .slice(0, 10)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      stock: p.stock_quantity || 0
    }));

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: t('Out of Stock', 'Nicht vorrätig'), color: '#EF4444', class: 'out-of-stock' };
    if (quantity < 10) return { status: t('Low Stock', 'Niedriger Bestand'), color: '#F59E0B', class: 'low-stock' };
    return { status: t('In Stock', 'Auf Lager'), color: '#10B981', class: 'in-stock' };
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
    priceRange.max
  ].filter(Boolean).length;

  return (
    <div className="inventory-management-page">
      <Sidebar />
      <div className="inventory-management">
        {/* Header */}
        <div className="inventory-header">
          <h1>📊 {t('Inventory Management', 'Lagerverwaltung')}</h1>
          <p>{t('Monitor and manage your product stock levels', 'Überwachen und verwalten Sie Ihre Produktbestände')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('Total Products', 'Produkte insgesamt')}</span>
              <span className="stat-value">{products.length}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon green">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('Total Stock', 'Gesamtbestand')}</span>
              <span className="stat-value">{products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon orange">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('Low Stock', 'Niedriger Bestand')}</span>
              <span className="stat-value">{products.filter(p => (p.stock_quantity || 0) < 10).length}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon red">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('Out of Stock', 'Nicht vorrätig')}</span>
              <span className="stat-value">{products.filter(p => (p.stock_quantity || 0) === 0).length}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Stock by Category Chart */}
          <div className="chart-card">
            <h3>{t('Stock by Category', 'Bestand nach Kategorie')}</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock Status Distribution */}
          <div className="chart-card">
            <h3>{t('Stock Status Distribution', 'Bestandsstatus-Verteilung')}</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockLevels}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {stockLevels.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Stock Products Chart */}
        <div className="chart-card full-width">
          <h3>{t('Top 10 Products by Stock', 'Top 10 Produkte nach Bestand')}</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStockProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="stock" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <div className="filters-title">
              <h3>{t('Filter & Search', 'Filtern & Suchen')}</h3>
              {activeFiltersCount > 0 && (
                <span className="active-filters-badge">{activeFiltersCount} {t('active', 'aktiv')}</span>
              )}
            </div>
            <div className="filters-controls">
              {activeFiltersCount > 0 && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <X size={16} />
                  {t('Clear All', 'Alle löschen')}
                </button>
              )}
            </div>
          </div>
          
          <div className="filters-content">
            <div className="filter-row">
              <div className="filter-group">
                <label>{t('Search Products', 'Produkte suchen')}</label>
                <div className="search-input-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder={t('Search by product name...', 'Nach Produktname suchen...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="filter-group">
                <label>{t('Category', 'Kategorie')}</label>
                <div className="select-container">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">{t('All Categories', 'Alle Kategorien')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="filter-group">
                <label>{t('Stock Status', 'Bestandsstatus')}</label>
                <div className="select-container">
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">{t('All Status', 'Alle Status')}</option>
                    <option value="in-stock">{t('In Stock', 'Auf Lager')}</option>
                    <option value="low-stock">{t('Low Stock', 'Niedriger Bestand')}</option>
                    <option value="out-of-stock">{t('Out of Stock', 'Nicht vorrätig')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>{t('Price Range', 'Preisspanne')}</label>
                <div className="price-range-container">
                  <div className="price-input-group">
                    <span className="price-label">{t('Min', 'Min')}</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="price-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <span className="price-separator">{t('to', 'bis')}</span>
                  <div className="price-input-group">
                    <span className="price-label">{t('Max', 'Max')}</span>
                    <input
                      type="number"
                      placeholder="999.99"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="price-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              
              <div className="filter-group">
                <label>{t('Sort By', 'Sortieren nach')}</label>
                <div className="select-container">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="name">{t('Name', 'Name')}</option>
                    <option value="category_id">{t('Category', 'Kategorie')}</option>
                    <option value="stock_quantity">{t('Stock Quantity', 'Lagerbestand')}</option>
                    <option value="price">{t('Price', 'Preis')}</option>
                  </select>
                </div>
              </div>
              
              <div className="filter-group">
                <label>{t('Sort Order', 'Sortierreihenfolge')}</label>
                <div className="select-container">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="filter-select"
                  >
                    <option value="asc">{t('Ascending', 'Aufsteigend')}</option>
                    <option value="desc">{t('Descending', 'Absteigend')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="table-card">
          <div className="table-header">
            <h3>{t('Inventory Details', 'Lagerdetails')}</h3>
            <span className="table-count">{filteredProducts.length} {t('items', 'Artikel')}</span>
          </div>
          
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>
                    {t('Product Name', 'Produktname')}
                    {sortBy === 'name' && <span className="sort-indicator">{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </th>
                  <th onClick={() => handleSort('category_id')}>
                    {t('Category', 'Kategorie')}
                    {sortBy === 'category_id' && <span className="sort-indicator">{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </th>
                  <th className="hide-mobile">{t('Barcode', 'Barcode')}</th>
                  <th onClick={() => handleSort('stock_quantity')}>
                    {t('Stock', 'Lager')}
                    {sortBy === 'stock_quantity' && <span className="sort-indicator">{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </th>
                  <th className="hide-mobile" onClick={() => handleSort('price')}>
                    {t('Unit Price', 'Stückpreis')}
                    {sortBy === 'price' && <span className="sort-indicator">{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>}
                  </th>
                  <th className="hide-mobile">{t('Stock Value', 'Lagerwert')}</th>
                  <th>{t('Status', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="loading-row">
                      <div className="loading-spinner"></div>
                      <span>{t('Loading...', 'Lädt...')}</span>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {t('No products found', 'Keine Produkte gefunden')}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity || 0);
                    const stockValue = (product.stock_quantity || 0) * parseFloat(product.price || 0);
                    
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="product-name">{product.name}</div>
                        </td>
                        <td>
                          <div className="category-name">
                            {categories.find((c) => c.id === product.category_id)?.name || "N/A"}
                          </div>
                        </td>
                        <td className="hide-mobile">
                          {product.barcode || "N/A"}
                        </td>
                        <td>
                          <div className="stock-quantity">
                            {product.stock_quantity || 0}
                          </div>
                        </td>
                        <td className="hide-mobile">
                          ${parseFloat(product.price || 0).toFixed(2)}
                        </td>
                        <td className="hide-mobile">
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
      </div>
    </div>
  );
};

export default InventoryManagement;