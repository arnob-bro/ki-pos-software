// ProductManagement.jsx
import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
import "./ProductManagement.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import * as XLSX from 'xlsx';
import useLanguageStore from '../../stores/languageStore';
import useUserStore from '../../stores/userStore';
        
const ProductManagement = () => {
  const navigate = useNavigate();
  const language = useLanguageStore((state) => state.language);
  const t = (en, de) => language === 'de' ? de : en;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category_id: "",
    barcode: "",
    price: "",
    vat_rate: "",
    stock_quantity: 0,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = useUserStore((state) => state.user);

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
      console.log(result);
			// setFilteredProducts(result.products || result);
		} catch (e) {
			setProducts([]);
			// setFilteredProducts([]);
		} finally {
			setLoading(false);
		}
	}, []);

  const fetchCategories = async () => {
    try {
      const result = await window.posAPI.listProductCategories();
      console.log(result);
      setCategories(result.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert category_id to number if it's not empty, otherwise keep as empty string
    const processedValue = name === 'category_id' ? (value ? value : '') : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editing) {
        await window.posAPI.updateProduct(formData, currentUser);
      } else {
        await window.posAPI.addProduct(formData, currentUser);
      }
      console.log(formData);
      fetchProducts();
      setFormData({ id: "", name: "", category_id: "", barcode: "", price: "", vat_rate: "", stock_quantity: 0 });
      setEditing(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert(t('Error saving product: ', 'Fehler beim Speichern des Produkts: ') + error.message);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('Are you sure you want to delete this product?', 'Möchten Sie dieses Produkt wirklich löschen?'))) {
      try {
        await window.posAPI.deleteProduct(id, currentUser);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(t('Error deleting product: ', 'Fehler beim Löschen des Produkts: ') + error.message);
      }
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
  
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      console.log('Parsed Data:', jsonData);
  
      try {
        // Send each row to your backend
        for (let product of jsonData) {
          await window.posAPI.addProduct(product, currentUser);
        }
        fetchProducts(); // refresh product list
        alert(t('Products imported successfully!', 'Produkte erfolgreich importiert!'));
      } catch (error) {
        console.error("Error importing products:", error);
        alert(t('Error importing products: ', 'Fehler beim Importieren der Produkte: ') + error.message);
      }
    };
  
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="product-management-page">
      <Sidebar />
      <div className="product-management">
        {/* <button className="back-btn" onClick={() => navigate("/dashboard")}>  Back</button> */}
        <h2>📦 {t('Product Management', 'Produktverwaltung')}</h2>

        <form onSubmit={handleSubmit} className="product-form">
  <div className="form-group">
    <label htmlFor="name">{t('Product Name', 'Produktname')}</label>
    <input id="name" name="name" value={formData.name} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label htmlFor="category_id">{t('Category', 'Kategorie')}</label>
    <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required>
      <option value="">{t('Select Category', 'Kategorie wählen')}</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label htmlFor="barcode">{t('Barcode', 'Barcode')}</label>
    <input id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label htmlFor="price">{t('Price ($)', 'Preis (€)')}</label>
    <input id="price" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label htmlFor="vat_rate">{t('VAT (%)', 'MwSt (%)')}</label>
    <input id="vat_rate" type="number" step="0.01" name="vat_rate" value={formData.vat_rate} onChange={handleChange} />
  </div>

  <div className="form-group">
    <label htmlFor="stock_quantity">{t('Stock Quantity', 'Lagerbestand')}</label>
    <input id="stock_quantity" type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} />
  </div>

  <button type="submit">{editing ? t('Update', 'Aktualisieren') : t('Add Product', 'Produkt hinzufügen')}</button>
</form>
<div className="excel">
  <label className="upload-btn">
    📁 {t('Import CSV/Excel', 'CSV/Excel importieren')}
    <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} hidden />
  </label>
</div>

        <table className="product-table">
          <thead>
            <tr>
              <th>{t('Name', 'Name')}</th>
              <th>{t('Category', 'Kategorie')}</th>
              <th>{t('Barcode', 'Barcode')}</th>
              <th>{t('Price', 'Preis')}</th>
              <th>{t('VAT %', 'MwSt %')}</th>
              <th>{t('Stock', 'Lager')}</th>
              <th>{t('Actions', 'Aktionen')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{categories.find((c) => c.id === p.category_id)?.name || "N/A"}</td>
                <td>{p.barcode}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>{p.vat_rate ? `${p.vat_rate}%` : '0%'}</td>
                <td>{p.stock_quantity}</td>
                <td>
                  <button className="edit-btn"  onClick={() => handleEdit(p)} title={t('Edit', 'Bearbeiten')}> ✏️</button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)} title={t('Delete', 'Löschen')}> 🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
