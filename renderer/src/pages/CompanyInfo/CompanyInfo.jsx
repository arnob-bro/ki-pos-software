import React, { useState } from 'react';
import './CompanyInfo.css';  
import Sidebar from '../../components/Sidebar';
import useLanguageStore from '../../stores/languageStore';

const CompanyProfile = () => {
  const language = useLanguageStore((state) => state.language);
  const t = (en, de) => language === 'de' ? de : en;

  const [companyData, setCompanyData] = useState({
    legalAddress: '',
    vatNumber: '',
    gobdEnabled: false,
    logo: null,
  });

  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setCompanyData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('legalAddress', companyData.legalAddress);
    formData.append('vatNumber', companyData.vatNumber);
    formData.append('gobdEnabled', companyData.gobdEnabled);
    if (companyData.logo) {
      formData.append('logo', companyData.logo);
    }

    fetch('http://localhost:4000/api/company-profile', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then(() => alert(t('Profile updated successfully!', 'Profil erfolgreich aktualisiert!')))
      .catch((err) => {
        console.error(err);
        alert(t('Error updating company profile', 'Fehler beim Aktualisieren des Firmenprofils'));
      });
  };

  return (
    <div className="company-profile-page">
      <Sidebar />

      <div className="company-profile-container">
        <h2>{t('🏢 Company Profile', '🏢 Firmenprofil')}</h2>

        <form onSubmit={handleSubmit} className="company-form">
          <label>
            {t('Legal Address', 'Rechtsanschrift')}
            <textarea
              name="legalAddress"
              value={companyData.legalAddress}
              onChange={handleChange}
              rows={3}
              required
            />
          </label>

          <label>
            {t('VAT Number', 'Steuernummer')}
            <input
              type="text"
              name="vatNumber"
              value={companyData.vatNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t('Upload Logo', 'Logo hochladen')}
            <input type="file" name="logo" accept="image/*" onChange={handleChange} />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="gobdEnabled"
              checked={companyData.gobdEnabled}
              onChange={handleChange}
            />
            {t('Enable GoBD/GDPdU Compliance', 'GoBD/GDPdU-Konformität aktivieren')}
            <span className="info-icon" onClick={() => setShowModal(true)}>{t('ℹ️', 'ℹ️')}</span>
          </label>

          <button type="submit" className="save-btn">{t('Save Profile', 'Profil speichern')}</button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>{t('X', 'X')}</button>
            <h3>{t('📘 GoBD/GDPdU Compliance', '📘 GoBD/GDPdU-Konformität')}</h3>
            <ul>
              <li>{t('Keep digital records unaltered (no manual overwrite).', 'Digitale Aufzeichnungen unverändert halten (kein manuelles Überschreiben).')}</li>
              <li>{t('Enable full audit trails for transactions.', 'Vollständige Aufzeichnungen für Transaktionen aktivieren.')}</li>
              <li>{t('Export data in readable formats (CSV/XML/IDEA).', 'Daten in lesbaren Formaten exportieren (CSV/XML/IDEA).')}</li>
              <li>{t('Store data for 10 years (legal requirement).', 'Daten für 10 Jahre aufbewahren (rechtliche Anforderung).')}</li>
              <li>{t('Ensure role-based access to audit data.', 'Sicherstellen, dass Zugriff auf Aufzeichnungen nach Rollen gesteuert wird.')}</li>
            </ul>
            <p>
              {t('Enabling this will activate audit trail logging and export options to comply with German tax standards.', 'Dies aktiviert die Protokollprotokollierung und Exportoptionen, um den deutschen Steuerstandards zu entsprechen.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
