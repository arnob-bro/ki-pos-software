// ProductManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductManagement.css";
import { useNavigate } from "react-router-dom";
        
const ProductManagement = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:4000/products");
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:4000/categories");
    setCategories(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await axios.put(`http://localhost:4000/products/${formData.id}`, formData);
    } else {
      await axios.post("http://localhost:4000/products", formData);
    }
    fetchProducts();
    setFormData({ id: "", name: "", category_id: "", barcode: "", price: "", vat_rate: "", stock_quantity: 0 });
    setEditing(false);
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditing(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="product-management">
     <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
      <h2>📦 Product Management</h2>

      <form onSubmit={handleSubmit} className="product-form">
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <select name="category_id" value={formData.category_id} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input name="barcode" placeholder="Barcode" value={formData.barcode} onChange={handleChange} />
        <input type="number" step="0.01" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <input type="number" step="0.01" name="vat_rate" placeholder="VAT %" value={formData.vat_rate} onChange={handleChange} />
        <input type="number" name="stock_quantity" placeholder="Stock Qty" value={formData.stock_quantity} onChange={handleChange} />
        <button type="submit">{editing ? "Update" : "Add Product"}</button>
      </form>

      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Barcode</th>
            <th>Price</th>
            <th>VAT %</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{categories.find((c) => c.id === p.category_id)?.name || "N/A"}</td>
              <td>{p.barcode}</td>
              <td>${parseFloat(p.price).toFixed(2)}</td>
              <td>{p.vat_rate}%</td>
              <td>{p.stock_quantity}</td>
              <td>
                <button onClick={() => handleEdit(p)}>✏️</button>
                <button onClick={() => handleDelete(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;
