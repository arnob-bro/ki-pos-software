const { ipcMain } = require("electron");
const PaymentSettingsController = require("../controllers/paymentSettingsController");

const controller = new PaymentSettingsController();

ipcMain.handle("paymentSettings:get", async () => {
  return controller.getSettings();
});

ipcMain.handle("paymentSettings:update", async (event, settings) => {
  return controller.updateSettings(settings);
});
