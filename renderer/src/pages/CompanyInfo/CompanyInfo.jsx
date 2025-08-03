import { useState, useEffect } from "react";
import "./CompanyInfo.css";
import Sidebar from "../../components/Sidebar";
import useLanguageStore from "../../stores/languageStore";

const CompanyProfile = () => {
  const language = useLanguageStore((state) => state.language);
  const t = (en, de) => (language === "de" ? de : en);

  const [companyData, setCompanyData] = useState({
    companyName: "",
    legalAddress: "",
    vatNumber: "",
    gobdEnabled: false,
    logoFile: null,       // new file chosen by user
    logoPreview: null,    // base64 string or URL for preview
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load company info from DB on mount
  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const data = await window.posAPI.getCompanyInfo();

        if (data) {
          setCompanyData({
            companyName: data.companyName || "",
            legalAddress: data.legalAddress || "",
            vatNumber: data.vatNumber || "",
            gobdEnabled: data.gobdEnabled || false,
            logoFile: null, // no file yet, only preview
            logoPreview: data.logoPath || data.logo || null, // base64 or stored path string
          });
        }
      } catch (error) {
        console.error("Error loading company info:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyInfo();
  }, []);

  // Update preview whenever a new file is chosen
  useEffect(() => {
    if (companyData.logoFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyData((prev) => ({ ...prev, logoPreview: reader.result }));
      };
      reader.readAsDataURL(companyData.logoFile);
    }
    // If no file, keep existing preview (from DB)
  }, [companyData.logoFile]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setCompanyData((prev) => ({
        ...prev,
        logoFile: files[0] || null,
      }));
    } else {
      setCompanyData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let logoBase64 = companyData.logoPreview; // default keep existing logo preview

    if (companyData.logoFile) {
      try {
        logoBase64 = await fileToBase64(companyData.logoFile);
      } catch {
        alert(t("Failed to read logo file", "Logo-Datei konnte nicht gelesen werden"));
        return;
      }
    }

    const payload = {
      companyName: companyData.companyName,
      legalAddress: companyData.legalAddress,
      vatNumber: companyData.vatNumber,
      gobdEnabled: companyData.gobdEnabled,
      logo: logoBase64,
    };

    const result = await window.posAPI.saveCompanyInfo(payload);

    if (result.success) {
      alert(t("✅ Settings saved successfully!", "✅ Einstellungen erfolgreich gespeichert!"));
    } else {
      alert(t("❌ Error saving settings: ", "❌ Fehler beim Speichern: ") + result.error);
    }
  };

  if (loading) return <div>{t("Loading...", "Laden...")}</div>;

  return (
    <div className="company-profile-page">
      <Sidebar />

      <div className="company-profile-container">
        <h2>{t("🏢 Company Profile", "🏢 Firmenprofil")}</h2>

        <form onSubmit={handleSubmit} className="company-form">
          <label>
            {t("Company Name", "Firmenname")}
            <input
              type="text"
              name="companyName"
              value={companyData.companyName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t("Legal Address", "Rechtsanschrift")}
            <textarea
              name="legalAddress"
              value={companyData.legalAddress}
              onChange={handleChange}
              rows={3}
              required
            />
          </label>

          <label>
            {t("VAT Number", "Steuernummer")}
            <input
              type="text"
              name="vatNumber"
              value={companyData.vatNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {t("Upload Logo", "Logo hochladen")}
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
            />
          </label>

          {/* Logo Preview */}
          {companyData.logoPreview && (
            <div className="logo-preview-container" style={{ margin: "10px 0" }}>
              <img
                src={companyData.logoPreview}
                alt="Logo Preview"
                style={{
                  maxHeight: 150,
                  maxWidth: "100%",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                  padding: 5,
                  borderRadius: 4,
                }}
              />
            </div>
          )}

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="gobdEnabled"
              checked={companyData.gobdEnabled}
              onChange={handleChange}
            />
            {t(
              "Enable GoBD/GDPdU Compliance",
              "GoBD/GDPdU-Konformität aktivieren"
            )}
            <span className="info-icon" onClick={() => setShowModal(true)}>
              {t("ℹ️", "ℹ️")}
            </span>
          </label>

          <button type="submit" className="save-btn">
            {t("Save Profile", "Profil speichern")}
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              {t("X", "X")}
            </button>
            <h3>{t("📘 GoBD/GDPdU Compliance", "📘 GoBD/GDPdU-Konformität")}</h3>
            <ul>
              <li>
                {t(
                  "Keep digital records unaltered (no manual overwrite).",
                  "Digitale Aufzeichnungen unverändert halten (kein manuelles Überschreiben)."
                )}
              </li>
              <li>
                {t(
                  "Enable full audit trails for transactions.",
                  "Vollständige Aufzeichnungen für Transaktionen aktivieren."
                )}
              </li>
              <li>
                {t(
                  "Export data in readable formats (CSV/XML/IDEA).",
                  "Daten in lesbaren Formaten exportieren (CSV/XML/IDEA)."
                )}
              </li>
              <li>
                {t(
                  "Store data for 10 years (legal requirement).",
                  "Daten für 10 Jahre aufbewahren (rechtliche Anforderung)."
                )}
              </li>
              <li>
                {t(
                  "Ensure role-based access to audit data.",
                  "Sicherstellen, dass Zugriff auf Aufzeichnungen nach Rollen gesteuert wird."
                )}
              </li>
            </ul>
            <p>
              {t(
                "Enabling this will activate audit trail logging and export options to comply with German tax standards.",
                "Dies aktiviert die Protokollprotokollierung und Exportoptionen, um den deutschen Steuerstandards zu entsprechen."
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
