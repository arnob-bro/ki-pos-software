// ipcHandlers/companyInfo.js
const SystemSettingsController = require("../controllers/systemSettingsController");
const SystemSettingsService = require("../services/systemSettingsService");

module.exports = function registerSystemSettingsHandlers(ipcMain, db) {
  const systemSettingsService = new SystemSettingsService(db);
  const systemSettingsController = new SystemSettingsController(systemSettingsService);

  ipcMain.handle("systemSettings:get", () => systemSettingsController.getSystemSettings());

  ipcMain.handle("systemSettings:update", (event, systemSettings) =>
    systemSettingsController.updateSystemSettings(systemSettings)
  );
};
