class TransactionController {
  constructor(transactionService) {
    this.transactionService = transactionService;
  }

  async addTransaction(data, currentUser) {
    try {
      console.log('DEBUG: TransactionController.addTransaction called with:', JSON.stringify(data, null, 2));
      
      // Basic validation (more can be added as needed)
      if (!data.user_id || !data.payment_method || typeof data.total_amount !== 'number') {
        throw new Error('Missing required transaction fields: user_id, payment_method, and total_amount are required');
      }
      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('Transaction must have at least one item');
      }
      
      // Convert and validate data types
      const processedData = {
        ...data,
        total_amount: Number(data.total_amount),
        vat_amount: Number(data.vat_amount || 0),
        discount_amount: Number(data.discount_amount || 0),
        items: data.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          vat_amount: Number(item.vat_amount || 0),
          discount_applied: Number(item.discount_applied || 0)
        }))
      };
      
      // Validate items structure
      for (const item of processedData.items) {
        if (!item.product_id || typeof item.quantity !== 'number' || typeof item.unit_price !== 'number') {
          throw new Error('Each item must have product_id, quantity, and unit_price');
        }
        if (item.quantity <= 0 || item.unit_price <= 0) {
          throw new Error('Item quantity and unit_price must be positive numbers');
        }
      }
      
      console.log('DEBUG: Processed transaction data:', JSON.stringify(processedData, null, 2));
      return await this.transactionService.addTransaction(processedData, currentUser);
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

  async getReceipts(filters = {}) {
    try {
      return await this.transactionService.getReceipts(filters);
    } catch (error) {
      throw new Error(`Failed to get receipts: ${error.message}`);
    }
  }
}

module.exports = TransactionController; 