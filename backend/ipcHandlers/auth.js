// ipcHandlers/auth.js
const { login } = require('../controllers/authController');

module.exports = function (ipcMain) {
  ipcMain.handle('login', async (event, userId, password) => {
    const result = login(userId, password);
    return result;
  });
};
