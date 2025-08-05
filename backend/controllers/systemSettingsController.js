// controllers/companyInfoController.js
class SystemSettingsController {
    constructor(systemSettingsService) {
      this.systemSettingsService = systemSettingsService;
    }
  
    getSystemSettings() {
      return this.systemSettingsService.getSystemSettings();
    }
  
    updateSystemSettings(systemSettings) {
      console.log(systemSettings);
      return this.systemSettingsService.updateSystemSettings(systemSettings);
    }
  }
  
  module.exports = SystemSettingsController;
  