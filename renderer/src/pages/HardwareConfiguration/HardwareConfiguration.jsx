import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "./HardwareConfiguration.css";
import useLanguageStore from "../../stores/languageStore";

const HardwareConfiguration = () => {
	const [config, setConfig] = useState({
		// EC Terminal Settings
		ecTerminal: {
			enabled: false,
			model: "",
			port: "",
			baudRate: "9600",
			timeout: "30",
			merchantId: "",
			terminalId: "",
			testMode: true,
		},

		// Visa Payment System Settings
		visaPayment: {
			enabled: false,
			provider: "visa",
			merchantId: "",
			terminalId: "",
			apiKey: "",
			secretKey: "",
			environment: "sandbox",
			supportedCards: ["visa", "mastercard", "amex", "discover"],
			contactless: true,
			chipCard: true,
			swipeCard: true,
			manualEntry: true,
			timeout: "60",
			autoCapture: true,
			testMode: true,
			currency: "USD",
			countryCode: "US",
			processingFee: "2.9",
			transactionFee: "0.30",
		},

		// Drawer Control Settings
		drawer: {
			enabled: false,
			port: "",
			openCommand: "27,112,0,25,250",
			closeCommand: "27,112,1,25,250",
			autoOpen: true,
		},

		// Receipt Printer Settings
		printer: {
			enabled: false,
			model: "",
			port: "",
			baudRate: "9600",
			paperWidth: "80",
			autoCut: true,
			printLogo: true,
			headerText: "",
			footerText: "",
		},

		// Sync Settings
		sync: {
			mode: "online", // 'online' or 'offline'
			autoSync: true,
			syncInterval: "5", // minutes
			offlineTimeout: "30", // seconds
			retryAttempts: "3",
			lastSync: null,
		},
	});

	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	// Available hardware options
	const ecTerminalModels = [
		"Ingenico iSC250",
		"Ingenico iSC350",
		"Verifone VX520",
		"Verifone VX680",
		"PAX A920",
		"PAX A80",
	];

	const printerModels = [
		"Epson TM-T88VI",
		"Epson TM-T82",
		"Star TSP100",
		"Citizen CT-S310II",
		"Custom",
	];

	const [ports, setPorts] = useState([
		"COM1",
		"COM2",
		"COM3",
		"COM4",
		"USB",
		"Network",
	]);

	const language = useLanguageStore((state) => state.language);
	const t = (en, de) => (language === "de" ? de : en);

	useEffect(() => {
		loadConfiguration();
		loadAvailablePorts();
	}, []);

	const loadAvailablePorts = async () => {
		try {
			if (!window.posAPI || !window.posAPI.getAvailablePorts) {
				return;
			}

			const result = await window.posAPI.getAvailablePorts();
			console.log(result);
			if (result.success && result.ports) {
				const portNames = result.ports.map((port) => port.path);
				setPorts(["", ...portNames, "USB", "Network"]);
			}
		} catch (error) {
			console.error("Failed to load available ports:", error);
		}
	};

	const loadConfiguration = async () => {
		setIsLoading(true);
		try {
			if (!window.posAPI || !window.posAPI.getHardwareConfig) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.getHardwareConfig();
			if (result.success) {
				setConfig(result.config);
			} else {
				setMessage({
					type: "error",
					text: result.message || "Failed to load configuration",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "Failed to load configuration" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (section, field, value) => {
		setConfig((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage({ type: "", text: "" });

		try {
			if (!window.posAPI || !window.posAPI.saveHardwareConfig) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.saveHardwareConfig(config);
			if (result.success) {
				setMessage({
					type: "success",
					text: "Configuration saved successfully!",
				});
			} else {
				setMessage({
					type: "error",
					text: result.message || "Failed to save configuration",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "Failed to save configuration" });
		} finally {
			setIsLoading(false);
		}
	};

	const testECTerminal = async () => {
		try {
			setMessage({ type: "info", text: "Testing EC terminal connection..." });
			if (!window.posAPI || !window.posAPI.testECTerminal) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.testECTerminal(config.ecTerminal);
			if (result.success) {
				setMessage({
					type: "success",
					text: result.message || "EC terminal test completed successfully!",
				});
			} else {
				setMessage({
					type: "error",
					text: result.message || "EC terminal test failed",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "EC terminal test failed" });
		}
	};

	const testVisaPayment = async () => {
		try {
			setMessage({ type: "info", text: "Testing Visa payment system..." });
			if (!window.posAPI || !window.posAPI.testVisaPayment) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.testVisaPayment(config.visaPayment);
			if (result.success) {
				setMessage({
					type: "success",
					text: result.message || "Visa payment system test completed successfully!",
				});
			} else {
				setMessage({
					type: "error",
					text: result.message || "Visa payment system test failed",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "Visa payment system test failed" });
		}
	};

	const testDrawer = async () => {
		try {
			setMessage({ type: "info", text: "Testing drawer..." });
			if (!window.posAPI || !window.posAPI.testDrawer) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.testDrawer(config.drawer);
			if (result.success) {
				setMessage({
					type: "success",
					text: result.message || "Drawer test completed successfully!",
				});
			} else {
				setMessage({
					type: "error",
					text: result.message || "Drawer test failed",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "Drawer test failed" });
		}
	};

	const testPrinter = async () => {
		try {
			setMessage({ type: "info", text: "Testing printer..." });
			if (!window.posAPI || !window.posAPI.testPrinter) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.testPrinter(config.printer);
			if (result.success) {
				setMessage({
					type: "success",
					text: result.message || "Printer test completed successfully!",
				});
			} else {
				setMessage({
					type: "error",
					text: result.message || "Printer test failed",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "Printer test failed" });
		}
	};

	const syncNow = async () => {
		try {
			setMessage({ type: "info", text: "Syncing data..." });
			if (!window.posAPI || !window.posAPI.syncData) {
				throw new Error("Hardware API not available");
			}

			const result = await window.posAPI.syncData();
			if (result.success) {
				setMessage({
					type: "success",
					text: result.message || "Data sync completed successfully!",
				});
				// Reload configuration to update last sync time
				await loadConfiguration();
			} else {
				setMessage({
					type: "error",
					text: result.message || "Data sync failed",
				});
			}
		} catch (error) {
			setMessage({ type: "error", text: "Data sync failed" });
		}
	};

	return (
		<div className='hardware-config-page'>
			<Sidebar />
			<div className='hardware-config'>
				<div className='header-section'>
					<h2>{t("🔧 Hardware Configuration", "🔧 Hardware-Konfiguration")}</h2>
					<button
						type='button'
						onClick={loadAvailablePorts}
						className='refresh-btn'
						title={t(
							"Refresh available ports",
							"Verfügbare Anschlüsse aktualisieren"
						)}
					>
						{t("🔄 Refresh Ports", "🔄 Anschlüsse aktualisieren")}
					</button>
				</div>

				{message.text && (
					<div className={`message ${message.type}`}>
						{t(
							message.text,
							message.text
								.replace(
									"Configuration saved successfully!",
									"Konfiguration erfolgreich gespeichert!"
								)
								.replace(
									"Failed to load configuration",
									"Konfiguration konnte nicht geladen werden"
								)
								.replace(
									"Failed to save configuration",
									"Konfiguration konnte nicht gespeichert werden"
								)
								.replace(
									"Testing EC terminal connection...",
									"EC-Terminal-Verbindung wird getestet..."
								)
								.replace(
									"EC terminal test completed successfully!",
									"EC-Terminal-Test erfolgreich abgeschlossen!"
								)
								.replace(
									"EC terminal test failed",
									"EC-Terminal-Test fehlgeschlagen"
								)
								.replace(
									"Testing drawer...",
									"Kassenschublade wird getestet..."
								)
								.replace(
									"Drawer test completed successfully!",
									"Kassenschubladentest erfolgreich abgeschlossen!"
								)
								.replace(
									"Drawer test failed",
									"Kassenschubladentest fehlgeschlagen"
								)
								.replace("Testing printer...", "Drucker wird getestet...")
								.replace(
									"Printer test completed successfully!",
									"Druckertest erfolgreich abgeschlossen!"
								)
								.replace("Printer test failed", "Druckertest fehlgeschlagen")
								.replace("Syncing data...", "Daten werden synchronisiert...")
								.replace(
									"Data sync completed successfully!",
									"Datensynchronisierung erfolgreich abgeschlossen!"
								)
								.replace(
									"Data sync failed",
									"Datensynchronisierung fehlgeschlagen"
								)
								.replace("Never", "Nie")
								.replace(
									"Testing Visa payment system...",
									"Visa-Zahlungssystem wird getestet..."
								)
								.replace(
									"Visa payment system test completed successfully!",
									"Visa-Zahlungssystem-Test erfolgreich abgeschlossen!"
								)
								.replace(
									"Visa payment system test failed",
									"Visa-Zahlungssystem-Test fehlgeschlagen"
								)
						)}
					</div>
				)}

				<form onSubmit={handleSubmit} className='config-form'>
					{/* EC Terminal Configuration */}
					<fieldset className='config-section'>
						<legend>
							{t("💳 EC Terminal Setup", "💳 EC-Terminal-Einrichtung")}
						</legend>

						<div className='form-group'>
							<label>
								<input
									type='checkbox'
									checked={config.ecTerminal.enabled}
									onChange={(e) =>
										handleChange("ecTerminal", "enabled", e.target.checked)
									}
								/>
								{t("Enable EC Terminal", "EC-Terminal aktivieren")}
							</label>
						</div>

						{config.ecTerminal.enabled && (
							<>
								<div className='form-group'>
									<label>{t("Terminal Model", "Terminalmodell")}</label>
									<select
										value={config.ecTerminal.model}
										onChange={(e) =>
											handleChange("ecTerminal", "model", e.target.value)
										}
									>
										<option value=''>
											{t("Select Model", "Modell wählen")}
										</option>
										{ecTerminalModels.map((model) => (
											<option key={model} value={model}>
												{model}
											</option>
										))}
									</select>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>{t("Port", "Anschluss")}</label>
										<select
											value={config.ecTerminal.port}
											onChange={(e) =>
												handleChange("ecTerminal", "port", e.target.value)
											}
										>
											<option value=''>
												{t("Select Port", "Anschluss wählen")}
											</option>
											{ports.map((port) => (
												<option key={port} value={port}>
													{port}
												</option>
											))}
										</select>
									</div>

									<div className='form-group'>
										<label>{t("Baud Rate", "Baudrate")}</label>
										<select
											value={config.ecTerminal.baudRate}
											onChange={(e) =>
												handleChange("ecTerminal", "baudRate", e.target.value)
											}
										>
											<option value='9600'>9600</option>
											<option value='19200'>19200</option>
											<option value='38400'>38400</option>
											<option value='57600'>57600</option>
											<option value='115200'>115200</option>
										</select>
									</div>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>{t("Merchant ID", "Händler-ID")}</label>
										<input
											type='text'
											value={config.ecTerminal.merchantId}
											onChange={(e) =>
												handleChange("ecTerminal", "merchantId", e.target.value)
											}
											placeholder={t(
												"Enter Merchant ID",
												"Händler-ID eingeben"
											)}
										/>
									</div>

									<div className='form-group'>
										<label>{t("Terminal ID", "Terminal-ID")}</label>
										<input
											type='text'
											value={config.ecTerminal.terminalId}
											onChange={(e) =>
												handleChange("ecTerminal", "terminalId", e.target.value)
											}
											placeholder={t(
												"Enter Terminal ID",
												"Terminal-ID eingeben"
											)}
										/>
									</div>
								</div>

								<div className='form-group'>
									<label>
										<input
											type='checkbox'
											checked={config.ecTerminal.testMode}
											onChange={(e) =>
												handleChange("ecTerminal", "testMode", e.target.checked)
											}
										/>
										{t("Test Mode", "Testmodus")}
									</label>
								</div>

								<button
									type='button'
									onClick={testECTerminal}
									className='test-btn'
								>
									{t("🧪 Test EC Terminal", "🧪 EC-Terminal testen")}
								</button>
							</>
						)}
					</fieldset>

					{/* Visa Payment System Configuration */}
					<fieldset className='config-section'>
						<legend>
							{t("💳 Visa Payment System", "💳 Visa-Zahlungssystem")}
						</legend>

						<div className='form-group'>
							<label>
								<input
									type='checkbox'
									checked={config.visaPayment.enabled}
									onChange={(e) =>
										handleChange("visaPayment", "enabled", e.target.checked)
									}
								/>
								{t("Enable Visa Payment System", "Visa-Zahlungssystem aktivieren")}
							</label>
						</div>

						{config.visaPayment.enabled && (
							<>
								<div className='form-row'>
									<div className='form-group'>
										<label>{t("Merchant ID", "Händler-ID")}</label>
										<input
											type='text'
											value={config.visaPayment.merchantId}
											onChange={(e) =>
												handleChange("visaPayment", "merchantId", e.target.value)
											}
											placeholder={t(
												"Enter Visa Merchant ID",
												"Visa-Händler-ID eingeben"
											)}
										/>
									</div>

									<div className='form-group'>
										<label>{t("Terminal ID", "Terminal-ID")}</label>
										<input
											type='text'
											value={config.visaPayment.terminalId}
											onChange={(e) =>
												handleChange("visaPayment", "terminalId", e.target.value)
											}
											placeholder={t(
												"Enter Terminal ID",
												"Terminal-ID eingeben"
											)}
										/>
									</div>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>{t("API Key", "API-Schlüssel")}</label>
										<input
											type='password'
											value={config.visaPayment.apiKey}
											onChange={(e) =>
												handleChange("visaPayment", "apiKey", e.target.value)
											}
											placeholder={t(
												"Enter Visa API Key",
												"Visa-API-Schlüssel eingeben"
											)}
										/>
									</div>

									<div className='form-group'>
										<label>{t("Secret Key", "Geheimschlüssel")}</label>
										<input
											type='password'
											value={config.visaPayment.secretKey}
											onChange={(e) =>
												handleChange("visaPayment", "secretKey", e.target.value)
											}
											placeholder={t(
												"Enter Visa Secret Key",
												"Visa-Geheimschlüssel eingeben"
											)}
										/>
									</div>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>{t("Environment", "Umgebung")}</label>
										<select
											value={config.visaPayment.environment}
											onChange={(e) =>
												handleChange("visaPayment", "environment", e.target.value)
											}
										>
											<option value='sandbox'>
												{t("Sandbox (Test)", "Sandbox (Test)")}
											</option>
											<option value='production'>
												{t("Production", "Produktion")}
											</option>
										</select>
									</div>

									<div className='form-group'>
										<label>{t("Currency", "Währung")}</label>
										<select
											value={config.visaPayment.currency}
											onChange={(e) =>
												handleChange("visaPayment", "currency", e.target.value)
											}
										>
											<option value='USD'>USD</option>
											<option value='EUR'>EUR</option>
											<option value='GBP'>GBP</option>
											<option value='CAD'>CAD</option>
											<option value='AUD'>AUD</option>
										</select>
									</div>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>
											{t("Processing Fee (%)", "Verarbeitungsgebühr (%)")}
										</label>
										<input
											type='number'
											value={config.visaPayment.processingFee}
											onChange={(e) =>
												handleChange("visaPayment", "processingFee", e.target.value)
											}
											step='0.1'
											min='0'
											max='10'
										/>
									</div>

									<div className='form-group'>
										<label>
											{t("Transaction Fee ($)", "Transaktionsgebühr ($)")}
										</label>
										<input
											type='number'
											value={config.visaPayment.transactionFee}
											onChange={(e) =>
												handleChange("visaPayment", "transactionFee", e.target.value)
											}
											step='0.01'
											min='0'
										/>
									</div>
								</div>

								<div className='form-group'>
									<label>{t("Supported Payment Methods", "Unterstützte Zahlungsmethoden")}</label>
									<div className='checkbox-group'>
										<label>
											<input
												type='checkbox'
												checked={config.visaPayment.contactless}
												onChange={(e) =>
													handleChange("visaPayment", "contactless", e.target.checked)
												}
											/>
											{t("Contactless (NFC)", "Kontaktlos (NFC)")}
										</label>
										<label>
											<input
												type='checkbox'
												checked={config.visaPayment.chipCard}
												onChange={(e) =>
													handleChange("visaPayment", "chipCard", e.target.checked)
												}
											/>
											{t("Chip Card", "Chip-Karte")}
										</label>
										<label>
											<input
												type='checkbox'
												checked={config.visaPayment.swipeCard}
												onChange={(e) =>
													handleChange("visaPayment", "swipeCard", e.target.checked)
												}
											/>
											{t("Swipe Card", "Karte durchziehen")}
										</label>
										<label>
											<input
												type='checkbox'
												checked={config.visaPayment.manualEntry}
												onChange={(e) =>
													handleChange("visaPayment", "manualEntry", e.target.checked)
												}
											/>
											{t("Manual Entry", "Manuelle Eingabe")}
										</label>
									</div>
								</div>

								<div className='form-group'>
									<label>
										<input
											type='checkbox'
											checked={config.visaPayment.testMode}
											onChange={(e) =>
												handleChange("visaPayment", "testMode", e.target.checked)
											}
										/>
										{t("Test Mode", "Testmodus")}
									</label>
								</div>

								<div className='form-group'>
									<label>
										<input
											type='checkbox'
											checked={config.visaPayment.autoCapture}
											onChange={(e) =>
												handleChange("visaPayment", "autoCapture", e.target.checked)
											}
										/>
										{t("Auto Capture", "Automatische Erfassung")}
									</label>
								</div>

								<button
									type='button'
									onClick={testVisaPayment}
									className='test-btn'
								>
									{t("🧪 Test Visa Payment", "🧪 Visa-Zahlung testen")}
								</button>
							</>
						)}
					</fieldset>

					{/* Drawer Control */}
					<fieldset className='config-section'>
						<legend>{t("�� Drawer Control", "💰 Kassenschublade")}</legend>

						<div className='form-group'>
							<label>
								<input
									type='checkbox'
									checked={config.drawer.enabled}
									onChange={(e) =>
										handleChange("drawer", "enabled", e.target.checked)
									}
								/>
								{t("Enable Cash Drawer", "Kassenschublade aktivieren")}
							</label>
						</div>

						{config.drawer.enabled && (
							<>
								<div className='form-group'>
									<label>{t("Drawer Port", "Schubladenanschluss")}</label>
									<select
										value={config.drawer.port}
										onChange={(e) =>
											handleChange("drawer", "port", e.target.value)
										}
									>
										<option value=''>
											{t("Select Port", "Anschluss wählen")}
										</option>
										{ports.map((port) => (
											<option key={port} value={port}>
												{port}
											</option>
										))}
									</select>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>
											{t("Open Command (ESC/P)", "Öffnungsbefehl (ESC/P)")}
										</label>
										<input
											type='text'
											value={config.drawer.openCommand}
											onChange={(e) =>
												handleChange("drawer", "openCommand", e.target.value)
											}
											placeholder={t(
												"e.g., 27,112,0,25,250",
												"z.B., 27,112,0,25,250"
											)}
										/>
									</div>

									<div className='form-group'>
										<label>
											{t("Close Command (ESC/P)", "Schließbefehl (ESC/P)")}
										</label>
										<input
											type='text'
											value={config.drawer.closeCommand}
											onChange={(e) =>
												handleChange("drawer", "closeCommand", e.target.value)
											}
											placeholder={t(
												"e.g., 27,112,1,25,250",
												"z.B., 27,112,1,25,250"
											)}
										/>
									</div>
								</div>

								<div className='form-group'>
									<label>
										<input
											type='checkbox'
											checked={config.drawer.autoOpen}
											onChange={(e) =>
												handleChange("drawer", "autoOpen", e.target.checked)
											}
										/>
										{t(
											"Auto-open drawer on payment completion",
											"Schublade nach Zahlung automatisch öffnen"
										)}
									</label>
								</div>

								<button type='button' onClick={testDrawer} className='test-btn'>
									{t("🧪 Test Drawer", "🧪 Schublade testen")}
								</button>
							</>
						)}
					</fieldset>

					{/* Receipt Printer Configuration */}
					<fieldset className='config-section'>
						<legend>
							{t(
								"🖨️ Receipt Printer Configuration",
								"🖨️ Belegdrucker-Konfiguration"
							)}
						</legend>

						<div className='form-group'>
							<label>
								<input
									type='checkbox'
									checked={config.printer.enabled}
									onChange={(e) =>
										handleChange("printer", "enabled", e.target.checked)
									}
								/>
								{t("Enable Receipt Printer", "Belegdrucker aktivieren")}
							</label>
						</div>

						{config.printer.enabled && (
							<>
								<div className='form-group'>
									<label>{t("Printer Model", "Druckermodell")}</label>
									<select
										value={config.printer.model}
										onChange={(e) =>
											handleChange("printer", "model", e.target.value)
										}
									>
										<option value=''>
											{t("Select Model", "Modell wählen")}
										</option>
										{printerModels.map((model) => (
											<option key={model} value={model}>
												{model}
											</option>
										))}
									</select>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>{t("Port", "Anschluss")}</label>
										<select
											value={config.printer.port}
											onChange={(e) =>
												handleChange("printer", "port", e.target.value)
											}
										>
											<option value=''>
												{t("Select Port", "Anschluss wählen")}
											</option>
											{ports.map((port) => (
												<option key={port} value={port}>
													{port}
												</option>
											))}
										</select>
									</div>

									<div className='form-group'>
										<label>{t("Baud Rate", "Baudrate")}</label>
										<select
											value={config.printer.baudRate}
											onChange={(e) =>
												handleChange("printer", "baudRate", e.target.value)
											}
										>
											<option value='9600'>9600</option>
											<option value='19200'>19200</option>
											<option value='38400'>38400</option>
											<option value='57600'>57600</option>
											<option value='115200'>115200</option>
										</select>
									</div>
								</div>

								<div className='form-row'>
									<div className='form-group'>
										<label>{t("Paper Width (mm)", "Papierbreite (mm)")}</label>
										<select
											value={config.printer.paperWidth}
											onChange={(e) =>
												handleChange("printer", "paperWidth", e.target.value)
											}
										>
											<option value='58'>58mm</option>
											<option value='80'>80mm</option>
											<option value='112'>112mm</option>
										</select>
									</div>
								</div>

								<div className='form-group'>
									<label>{t("Header Text", "Kopfzeile")}</label>
									<textarea
										value={config.printer.headerText}
										onChange={(e) =>
											handleChange("printer", "headerText", e.target.value)
										}
										placeholder={t(
											"Enter header text for receipts",
											"Kopfzeile für Belege eingeben"
										)}
										rows='2'
									/>
								</div>

								<div className='form-group'>
									<label>{t("Footer Text", "Fußzeile")}</label>
									<textarea
										value={config.printer.footerText}
										onChange={(e) =>
											handleChange("printer", "footerText", e.target.value)
										}
										placeholder={t(
											"Enter footer text for receipts",
											"Fußzeile für Belege eingeben"
										)}
										rows='2'
									/>
								</div>

								<div className='form-group'>
									<label>
										<input
											type='checkbox'
											checked={config.printer.autoCut}
											onChange={(e) =>
												handleChange("printer", "autoCut", e.target.checked)
											}
										/>
										{t(
											"Auto-cut paper after printing",
											"Papier nach dem Drucken automatisch abschneiden"
										)}
									</label>
								</div>

								<div className='form-group'>
									<label>
										<input
											type='checkbox'
											checked={config.printer.printLogo}
											onChange={(e) =>
												handleChange("printer", "printLogo", e.target.checked)
											}
										/>
										{t(
											"Print company logo on receipts",
											"Firmenlogo auf Belegen drucken"
										)}
									</label>
								</div>

								<button
									type='button'
									onClick={testPrinter}
									className='test-btn'
								>
									{t("🧪 Test Printer", "🧪 Drucker testen")}
								</button>
							</>
						)}
					</fieldset>

					{/* Offline/Online Sync Settings */}
					<fieldset className='config-section'>
						<legend>
							{t(
								"🔄 Offline/Online Sync Settings",
								"🔄 Offline/Online-Synchronisation"
							)}
						</legend>

						<div className='form-group'>
							<label>{t("Sync Mode", "Synchronisationsmodus")}</label>
							<select
								value={config.sync.mode}
								onChange={(e) => handleChange("sync", "mode", e.target.value)}
							>
								<option value='online'>
									{t("Online Mode", "Online-Modus")}
								</option>
								<option value='offline'>
									{t("Offline Mode", "Offline-Modus")}
								</option>
								<option value='hybrid'>
									{t("Hybrid Mode", "Hybrid-Modus")}
								</option>
							</select>
						</div>

						<div className='form-group'>
							<label>
								<input
									type='checkbox'
									checked={config.sync.autoSync}
									onChange={(e) =>
										handleChange("sync", "autoSync", e.target.checked)
									}
								/>
								{t(
									"Enable Auto Sync",
									"Automatische Synchronisation aktivieren"
								)}
							</label>
						</div>

						{config.sync.autoSync && (
							<div className='form-group'>
								<label>
									{t(
										"Sync Interval (minutes)",
										"Synchronisationsintervall (Minuten)"
									)}
								</label>
								<select
									value={config.sync.syncInterval}
									onChange={(e) =>
										handleChange("sync", "syncInterval", e.target.value)
									}
								>
									<option value='1'>{t("1 minute", "1 Minute")}</option>
									<option value='5'>{t("5 minutes", "5 Minuten")}</option>
									<option value='15'>{t("15 minutes", "15 Minuten")}</option>
									<option value='30'>{t("30 minutes", "30 Minuten")}</option>
									<option value='60'>{t("1 hour", "1 Stunde")}</option>
								</select>
							</div>
						)}

						<div className='form-row'>
							<div className='form-group'>
								<label>
									{t("Offline Timeout (seconds)", "Offline-Timeout (Sekunden)")}
								</label>
								<input
									type='number'
									value={config.sync.offlineTimeout}
									onChange={(e) =>
										handleChange("sync", "offlineTimeout", e.target.value)
									}
									min='5'
									max='300'
								/>
							</div>

							<div className='form-group'>
								<label>{t("Retry Attempts", "Wiederholungsversuche")}</label>
								<input
									type='number'
									value={config.sync.retryAttempts}
									onChange={(e) =>
										handleChange("sync", "retryAttempts", e.target.value)
									}
									min='1'
									max='10'
								/>
							</div>
						</div>

						<div className='form-group'>
							<label>{t("Last Sync", "Letzte Synchronisation")}</label>
							<input
								type='text'
								value={config.sync.lastSync || t("Never", "Nie")}
								readOnly
								className='readonly'
							/>
						</div>

						<button type='button' onClick={syncNow} className='test-btn'>
							{t("🔄 Sync Now", "🔄 Jetzt synchronisieren")}
						</button>
					</fieldset>

					<div className='form-actions'>
						<button type='submit' disabled={isLoading} className='save-btn'>
							{isLoading
								? t("💾 Saving...", "💾 Speichern...")
								: t("💾 Save Configuration", "💾 Konfiguration speichern")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default HardwareConfiguration;
