// ipcHandlers/auth.js
const createAuthController = require('../controllers/authController');
const ShiftModel = require('../models/ShiftModel');

module.exports = function (ipcMain, db) {
  const authController = createAuthController(db);

  ipcMain.handle('login', async (event, identifier, password) => {
    try {
      const result = await authController.login(identifier, password);
      return result;
    } catch (error) {
      console.error('Login IPC error:', error);
      return {
        success: false,
        message: 'Login failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  ipcMain.handle('register', async (event, userData, currentUser) => {
    try {
      console.log('currentUser in registerUser:', currentUser);
      const result = await authController.register(userData, currentUser);
      return result;
    } catch (error) {
      console.error('Register IPC error:', error);
      return {
        success: false,
        message: 'Registration failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  ipcMain.handle('logout', async (event, userId, refreshToken) => {
    try {
      const result = await authController.logout(userId, refreshToken);
      return result;
    } catch (error) {
      console.error('Logout IPC error:', error);
      return {
        success: false,
        message: 'Logout failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  ipcMain.handle('validateSession', async (event, token) => {
    try {
      const result = await authController.validateSession(token);
      return result;
    } catch (error) {
      console.error('Session validation IPC error:', error);
      return {
        success: false,
        message: 'Session validation failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  ipcMain.handle('getProfile', async (event, userId) => {
    try {
      const result = await authController.getProfile(userId);
      return result;
    } catch (error) {
      console.error('Get profile IPC error:', error);
      return {
        success: false,
        message: 'Profile retrieval failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  ipcMain.handle('updateProfile', async (event, userId, updateData) => {
    try {
      const result = await authController.updateProfile(userId, updateData);
      return result;
    } catch (error) {
      console.error('Update profile IPC error:', error);
      return {
        success: false,
        message: 'Profile update failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  ipcMain.handle('changePassword', async (event, userId, currentPassword, newPassword) => {
    try {
      const result = await authController.changePassword(userId, currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error('Change password IPC error:', error);
      return {
        success: false,
        message: 'Password change failed',
        code: 'IPC_ERROR',
        error: error.message
      };
    }
  });

  // Start a shift
  ipcMain.handle('shift:start', async (event, userId) => {
    try {
      const shift = ShiftModel.startShift(userId);
      return { success: true, shift };
    } catch (error) {
      console.error('Start shift IPC error:', error);
      return { success: false, message: 'Failed to start shift', error: error.message };
    }
  });

  // End a shift
  ipcMain.handle('shift:end', async (event, shiftId) => {
    try {
      ShiftModel.endShift(shiftId);
      return { success: true };
    } catch (error) {
      console.error('End shift IPC error:', error);
      return { success: false, message: 'Failed to end shift', error: error.message };
    }
  });

  // Get current shift for a user
  ipcMain.handle('shift:getCurrent', async (event, userId) => {
    try {
      const shift = ShiftModel.getCurrentShift(userId);
      return { success: true, shift };
    } catch (error) {
      console.error('Get current shift IPC error:', error);
      return { success: false, message: 'Failed to get current shift', error: error.message };
    }
  });
};