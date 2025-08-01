import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./SystemSettings.css";
import useLanguageStore from "../../stores/languageStore";

const SystemSettings = () => {
	const [formData, setFormData] = useState({
		vat: "7",
		companyName: "",
		companyLogo: null,
		companyAddress: "",
		currency: "USD",
		backupPath: "",
		discount: "",
	});

	const availableLanguages = [
		{ value: "en", label: "English" },
		{ value: "de", label: "German" },
	];
	const vatOptions = ["7", "19"];

	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);
	const t = (en, de) => (language === "de" ? de : en);

	const handleChange = (e) => {
		const { name, value, type, files } = e.target;
		if (type === "file") {
			setFormData({ ...formData, [name]: files[0] });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const handleLanguageChange = (e) => {
		setLanguage(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("System settings submitted:", formData);
	};

	return (
		<div className='system-settings-page'>
			<Sidebar />
			<div className='system-settings'>
				<h2>{t("⚙️ System Settings", "⚙️ Systemeinstellungen")}</h2>
				<form onSubmit={handleSubmit} className='settings-form'>
					{/* VAT, Currency, Language */}
					<div className='flex-row'>
						<div className='form-group'>
							<label htmlFor='vat'>{t("VAT (%)", "MwSt (%)")}</label>
							<select
								id='vat'
								name='vat'
								value={formData.vat}
								onChange={handleChange}
							>
								{vatOptions.map((rate) => (
									<option key={rate} value={rate}>
										{rate}%
									</option>
								))}
							</select>
						</div>

						<div className='form-group'>
							<label>{t("💱 Currency", "💱 Währung")}</label>
							<select
								name='currency'
								value={formData.currency}
								onChange={handleChange}
							>
								<option value='USD'>{t("USD ($)", "USD ($)")}</option>
								<option value='EUR'>{t("EUR (€)", "EUR (€)")}</option>
								<option value='GBP'>{t("GBP (£)", "GBP (£)")}</option>
							</select>
						</div>

						<div className='form-group'>
							<label>{t("🌐 Language", "🌐 Sprache")}</label>
							<select
								name='language'
								value={language}
								onChange={handleLanguageChange}
							>
								{availableLanguages.map((lang) => (
									<option key={lang.value} value={lang.value}>
										{t(
											lang.label,
											lang.value === "en" ? "Englisch" : "Deutsch"
										)}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Company Info */}
					<fieldset className='form-group'>
						<legend>{t("🏢 Company Info", "🏢 Firmeninformationen")}</legend>
						<label>{t("Company Name", "Firmenname")}</label>
						<input
							type='text'
							name='companyName'
							value={formData.companyName}
							onChange={handleChange}
						/>

						<label>{t("Legal Address", "Rechtliche Adresse")}</label>
						<textarea
							name='companyAddress'
							value={formData.companyAddress}
							onChange={handleChange}
						></textarea>

						<label>{t("Logo", "Logo")}</label>
						<input
							type='file'
							name='companyLogo'
							accept='image/*'
							onChange={handleChange}
						/>
					</fieldset>

					{/* Backup Path */}
					<div className='flex-row'>
						<div className='form-group'>
							<label>{t("💾 Data Backup Path", "💾 Backup-Pfad")}</label>
							<input
								type='text'
								name='backupPath'
								value={formData.backupPath}
								onChange={handleChange}
								placeholder={t("e.g., D:/POSBackup", "z.B., D:/POSBackup")}
							/>
						</div>

						{/* Discount */}
						<div className='form-group'>
							<label>
								{t("Max Discount Allowed (%)", "Maximal erlaubter Rabatt (%)")}
							</label>
							<select
								name='discount'
								value={formData.discount}
								onChange={(e) => {
									const value = e.target.value;
									if (value === "custom") {
										setFormData({ ...formData, discount: "customValue" }); // Temporary flag
									} else {
										setFormData({ ...formData, discount: value });
									}
								}}
							>
								<option value=''>
									{t("-- Select Discount --", "-- Rabatt wählen --")}
								</option>
								<option value='5'>5%</option>
								<option value='10'>10%</option>
								<option value='25'>25%</option>
								<option value='custom'>
									{t("Custom", "Benutzerdefiniert")}
								</option>
							</select>

							{formData.discount === "customValue" && (
								<input
									type='number'
									name='customDiscount'
									placeholder={t(
										"Enter custom %",
										"Geben Sie einen benutzerdefinierten Prozentsatz ein"
									)}
									onChange={(e) =>
										setFormData({ ...formData, discount: e.target.value })
									}
								/>
							)}
						</div>
					</div>

					<button type='submit' className='save-btn'>
						{t("💾 Save Settings", "Einstellungen speichern")}
					</button>
				</form>
			</div>
		</div>
	);
};

export default SystemSettings;
