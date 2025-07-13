const { ipcMain } = require('electron');
const hardwareService = require('../services/hardwareService');

// Hardware Configuration IPC Handlers
function setupHardwareHandlers() {
  // Get hardware configuration
  ipcMain.handle('hardware:getConfig', async (event) => {
    try {
      const config = await hardwareService.getHardwareConfig();
      return { success: true, config };
    } catch (error) {
      console.error('Error getting hardware config:', error);
      return { success: false, message: error.message };
    }
  });

  // Save hardware configuration
  ipcMain.handle('hardware:saveConfig', async (event, config) => {
    try {
      const result = await hardwareService.saveHardwareConfig(config);
      return { success: true, message: 'Configuration saved successfully' };
    } catch (error) {
      console.error('Error saving hardware config:', error);
      return { success: false, message: error.message };
    }
  });

  // Test EC Terminal
  ipcMain.handle('hardware:testECTerminal', async (event, config) => {
    try {
      const result = await hardwareService.testECTerminal(config);
      return { success: true, message: 'EC Terminal test completed successfully' };
    } catch (error) {
      console.error('Error testing EC terminal:', error);
      return { success: false, message: error.message };
    }
  });

  // Test Drawer
  ipcMain.handle('hardware:testDrawer', async (event, config) => {
    try {
      const result = await hardwareService.testDrawer(config);
      return { success: true, message: 'Drawer test completed successfully' };
    } catch (error) {
      console.error('Error testing drawer:', error);
      return { success: false, message: error.message };
    }
  });

  // Test Printer
  ipcMain.handle('hardware:testPrinter', async (event, config) => {
    try {
      const result = await hardwareService.testPrinter(config);
      return { success: true, message: 'Printer test completed successfully' };
    } catch (error) {
      console.error('Error testing printer:', error);
      return { success: false, message: error.message };
    }
  });

  // Manual Sync
  ipcMain.handle('hardware:syncData', async (event) => {
    try {
      const result = await hardwareService.syncData();
      return { success: true, message: 'Data sync completed successfully' };
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: false, message: error.message };
    }
  });

  // Get available ports
  ipcMain.handle('hardware:getAvailablePorts', async (event) => {
    try {
      const ports = await hardwareService.getAvailablePorts();
      return { success: true, ports };
    } catch (error) {
      console.error('Error getting available ports:', error);
      return { success: false, message: error.message };
    }
  });

  // Get hardware status
  ipcMain.handle('hardware:getStatus', async (event) => {
    try {
      const status = await hardwareService.getHardwareStatus();
      return { success: true, status };
    } catch (error) {
      console.error('Error getting hardware status:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { setupHardwareHandlers };
