import React, { useState } from 'react';
import './SystemSettings.css';

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    vat: '7',
    companyName: '',
    companyLogo: null,
    companyAddress: '',
    currency: 'USD',
    language: 'English',
    backupPath: '',
    discount: ''
  });

  const availableLanguages = ['English', 'German'];
  const vatOptions = ['7', '19'];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('System settings submitted:', formData);
    // TODO: Connect this to your API or backend logic
  };

  return (
    <div className="system-settings">
      <h2>⚙️ System Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">

        {/* VAT */}
        <div className="form-group">
          <label htmlFor="vat">VAT (%)</label>
          <select id="vat" name="vat" value={formData.vat} onChange={handleChange}>
            {vatOptions.map((rate) => (
              <option key={rate} value={rate}>{rate}%</option>
            ))}
          </select>
        </div>

        {/* Company Info */}
        <fieldset className="form-group">
          <legend>🏢 Company Info</legend>

          <label>Company Name</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} />

          <label>Legal Address</label>
          <textarea name="companyAddress" value={formData.companyAddress} onChange={handleChange}></textarea>

          <label>Logo</label>
          <input type="file" name="companyLogo" accept="image/*" onChange={handleChange} />
        </fieldset>

        {/* Currency */}
        <div className="form-group">
          <label>💱 Currency</label>
          <select name="currency" value={formData.currency} onChange={handleChange}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        {/* Language */}
        <div className="form-group">
          <label>🌐 Language</label>
          <select name="language" value={formData.language} onChange={handleChange}>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Backup Path */}
        <div className="form-group">
          <label>💾 Data Backup Path</label>
          <input
            type="text"
            name="backupPath"
            value={formData.backupPath}
            onChange={handleChange}
            placeholder="e.g., D:/POSBackup"
          />
        </div>

        {/* Discount */}
        <div className="form-group">
          <label>🤑 Max Discount Allowed (%)</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="save-btn">💾 Save Settings</button>
      </form>
    </div>
  );
};

export default SystemSettings;
