const PaymentSettingsService = require("../services/paymentSettingsService");

class PaymentSettingsController {
  constructor() {
    this.service = new PaymentSettingsService();
  }

  getSettings() {
    return this.service.getSettings();
  }

  updateSettings(settings) {
    return this.service.updateSettings(settings);
  }
}

module.exports = PaymentSettingsController;
