import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "./SystemSettings.css";
import useLanguageStore from "../../stores/languageStore";

const SystemSettings = () => {
  const [formData, setFormData] = useState({
    vat: "7",
    currency: "USD",
    backupPath: "",
  });

  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState("");

  const availableLanguages = [
    { value: "en", label: "English" },
    { value: "de", label: "German" },
  ];
  const vatOptions = ["7", "19"];

  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = (en, de) => (language === "de" ? de : en);

  // Handle simple inputs: vat, currency, backupPath
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Discount handlers
  const addDiscount = () => {
    const percentage = parseInt(newDiscount);
    if (!percentage || percentage < 1 || percentage > 100) {
      alert(
        t(
          "Please enter a valid discount % between 1 and 100.",
          "Bitte geben Sie einen gültigen Rabatt % zwischen 1 und 100 ein."
        )
      );
      return;
    }
    if (discounts.some((d) => d.percentage === percentage)) {
      alert(t("Discount already exists.", "Rabatt existiert bereits."));
      return;
    }
    const newId = discounts.length > 0 ? discounts[discounts.length - 1].id + 1 : 1;
    setDiscounts([...discounts, { id: newId, percentage, active: true }]);
    setNewDiscount("");
  };

  const toggleDiscountActive = (id) => {
    setDiscounts(
      discounts.map((d) => (d.id === id ? { ...d, active: !d.active } : d))
    );
  };

  const removeDiscount = (id) => {
    setDiscounts(discounts.filter((d) => d.id !== id));
  };

  // On form submit: just log the data for now
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("System settings submitted:", { ...formData, discounts });
    alert(t("Settings saved! Check console log.", "Einstellungen gespeichert! Prüfen Sie die Konsole."));
  };

  // TODO: Load saved settings and discounts from backend on mount
  useEffect(() => {
    // Example:
    // const savedSettings = await window.posAPI.getSystemSettings();
    // setFormData(savedSettings.formData);
    // setDiscounts(savedSettings.discounts);
  }, []);

  return (
    <div className="system-settings-page">
      <Sidebar />
      <div className="system-settings">
        <h2>{t("⚙️ System Settings", "⚙️ Systemeinstellungen")}</h2>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* VAT, Currency, Language */}
          <div className="flex-row">
            <div className="form-group">
              <label htmlFor="vat">{t("VAT (%)", "MwSt (%)")}</label>
              <select id="vat" name="vat" value={formData.vat} onChange={handleChange}>
                {vatOptions.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t("💱 Currency", "💱 Währung")}</label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                <option value="USD">{t("USD ($)", "USD ($)")}</option>
                <option value="EUR">{t("EUR (€)", "EUR (€)")}</option>
                <option value="GBP">{t("GBP (£)", "GBP (£)")}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("🌐 Language", "🌐 Sprache")}</label>
              <select name="language" value={language} onChange={handleLanguageChange}>
                {availableLanguages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {t(lang.label, lang.value === "en" ? "Englisch" : "Deutsch")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Backup Path */}
          <div className="form-group">
            <label>{t("💾 Data Backup Path", "💾 Backup-Pfad")}</label>
            <input
              type="text"
              name="backupPath"
              value={formData.backupPath}
              onChange={handleChange}
              placeholder={t("e.g., D:/POSBackup", "z.B., D:/POSBackup")}
            />
          </div>

          {/* Discounts Manager */}
          <fieldset className="form-group">
            <legend>{t("Manage Discounts", "Rabatte verwalten")}</legend>

            <ul className="discount-list">
              {discounts.length === 0 && <li>{t("No discounts added.", "Keine Rabatte hinzugefügt.")}</li>}
              {discounts.map(({ id, percentage, active }) => (
                <li key={id} className="discount-item">
                  <span>{percentage}%</span>
                  <button
                    type="button"
                    className={active ? "btn-active" : "btn-inactive"}
                    onClick={() => toggleDiscountActive(id)}
                  >
                    {active ? t("Deactivate", "Deaktivieren") : t("Activate", "Aktivieren")}
                  </button>
                  <button type="button" onClick={() => removeDiscount(id)}>
                    {t("Delete", "Löschen")}
                  </button>
                </li>
              ))}
            </ul>

            <div className="add-discount">
              <input
                type="number"
                min="1"
                max="100"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder={t("Add new discount %", "Neuen Rabatt % hinzufügen")}
              />
              <button type="button" onClick={addDiscount}>
                {t("Add Discount", "Rabatt hinzufügen")}
              </button>
            </div>
          </fieldset>

          <button type="submit" className="save-btn">
            {t("💾 Save Settings", "Einstellungen speichern")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;
