const TransactionService = require('../services/transactionService');
const TransactionController = require('../controllers/transactionController');

module.exports = function registerTransactionHandlers(ipcMain, db) {
  const transactionService = new TransactionService(db);
  const transactionController = new TransactionController(transactionService);

  ipcMain.handle('transactions:add', async (event, data) => {
    try {
      console.log('DEBUG: Received transaction data:', JSON.stringify(data, null, 2));
      const result = await transactionController.addTransaction(data);
      console.log('DEBUG: Transaction added successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Error adding transaction:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  });

  ipcMain.handle('transactions:list', async (event, page = 1, limit = 20) => {
    try {
      return await transactionController.listTransactions(page, limit);
    } catch (error) {
      console.error('Error listing transactions:', error.message);
      throw error;
    }
  });

  ipcMain.handle('transactions:get', async (event, id) => {
    try {
      return await transactionController.getTransactionById(id);
    } catch (error) {
      console.error('Error getting transaction:', error.message);
      throw error;
    }
  });
}; 