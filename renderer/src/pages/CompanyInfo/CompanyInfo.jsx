import React, { useState } from 'react';
import './CompanyInfo.css';  
import Sidebar from '../../components/Sidebar';

const CompanyProfile = () => {
  const [companyData, setCompanyData] = useState({
    legalAddress: '',
    vatNumber: '',
    gobdEnabled: false,
    logo: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setCompanyData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // FormData for file upload
    const formData = new FormData();
    formData.append('legalAddress', companyData.legalAddress);
    formData.append('vatNumber', companyData.vatNumber);
    formData.append('gobdEnabled', companyData.gobdEnabled);
    if (companyData.logo) {
      formData.append('logo', companyData.logo);
    }

    // Send to backend (you may need to adjust the endpoint)
    fetch('http://localhost:4000/api/company-profile', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert('Profile updated successfully!');
      })
      .catch((err) => {
        console.error(err);
        alert('Error updating company profile');
      });
  };

  return (
    <div className="company-profile-page">
      <Sidebar />

      <div className="company-profile-container">
        <h2>🏢Company Profile</h2>

        <form onSubmit={handleSubmit} className="company-form">
          <label>
            Legal Address:
            <textarea
              name="legalAddress"
              value={companyData.legalAddress}
              onChange={handleChange}
              rows={3}
              required
            />
          </label>

          <label>
            VAT Number:
            <input
              type="text"
              name="vatNumber"
              value={companyData.vatNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Upload Logo:
            <input type="file" name="logo" accept="image/*" onChange={handleChange} />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="gobdEnabled"
              checked={companyData.gobdEnabled}
              onChange={handleChange}
            />
            Enable GoBD/GDPdU Compliance
          </label>

          <button type="submit" className="save-btn">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
