class TransactionController {
  constructor(transactionService) {
    this.transactionService = transactionService;
  }

  async addTransaction(data) {
    try {
      // Basic validation (more can be added as needed)
      if (!data.user_id || !data.payment_method || typeof data.total_amount !== 'number') {
        throw new Error('Missing required transaction fields: user_id, payment_method, and total_amount are required');
      }
      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('Transaction must have at least one item');
      }
      
      // Validate items structure
      for (const item of data.items) {
        if (!item.product_id || typeof item.quantity !== 'number' || typeof item.unit_price !== 'number') {
          throw new Error('Each item must have product_id, quantity, and unit_price');
        }
        if (item.quantity <= 0 || item.unit_price <= 0) {
          throw new Error('Item quantity and unit_price must be positive numbers');
        }
      }
      
      return await this.transactionService.addTransaction(data);
    } catch (error) {
      throw new Error(`Failed to add transaction: ${error.message}`);
    }
  }

  async listTransactions(page = 1, limit = 20) {
    try {
      return await this.transactionService.listTransactions(page, limit);
    } catch (error) {
      throw new Error(`Failed to list transactions: ${error.message}`);
    }
  }

  async getTransactionById(id) {
    try {
      return await this.transactionService.getTransactionById(id);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }
}

module.exports = TransactionController; 