const fs = require("fs");
const path = require("path");

class PaymentSettingsService {
  constructor() {
    this.paymentSettingsPath = path.join(__dirname, "../config/paymentSettings.json");
  }

  getSettings() {
    try {
      if (!fs.existsSync(this.paymentSettingsPath)) {
        throw new Error("Settings file not found.");
      }
      const data = fs.readFileSync(this.paymentSettingsPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("[PaymentSettingsService] Load error:", error.message);
      return null;
    }
  }

  updateSettings(newSettings) {
    try {
      fs.writeFileSync(this.paymentSettingsPath, JSON.stringify(newSettings, null, 2));
      return { success: true };
    } catch (error) {
      console.error("[PaymentSettingsService] Save error:", error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PaymentSettingsService;
