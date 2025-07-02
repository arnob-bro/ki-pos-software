const { v4: uuidv4 } = require('uuid');

class TransactionService {
  constructor(db) {
    this.db = db;
  }

  // Add a transaction and its items
  async addTransaction(transaction) {
    // transaction: { user_id, customer_id, shift_id, payment_method, total_amount, vat_amount, discount_amount, tse_signature_id, items: [{product_id, quantity, unit_price, vat_amount, discount_applied}] }
    if (!transaction || !Array.isArray(transaction.items) || transaction.items.length === 0) {
      throw new Error('Transaction must have at least one item');
    }

    // Validate that user exists
    const userExists = this.db.prepare('SELECT id FROM users WHERE id = ?').get(transaction.user_id);
    if (!userExists) {
      throw new Error(`User with id '${transaction.user_id}' does not exist`);
    }

    // Validate that all products exist
    for (const item of transaction.items) {
      const productExists = this.db.prepare('SELECT id FROM products WHERE id = ?').get(item.product_id);
      if (!productExists) {
        throw new Error(`Product with id '${item.product_id}' does not exist`);
      }
    }

    const id = uuidv4();
    
    // Use database transaction to ensure atomicity
    const dbTransaction = this.db.transaction(() => {
      const stmt = this.db.prepare(`
        INSERT INTO transactions (id, user_id, customer_id, shift_id, payment_method, total_amount, vat_amount, discount_amount, tse_signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        transaction.user_id,
        transaction.customer_id || null,
        transaction.shift_id || null,
        transaction.payment_method,
        transaction.total_amount,
        transaction.vat_amount || 0,
        transaction.discount_amount || 0,
        transaction.tse_signature || null
      );
      
      // Insert items
      const itemStmt = this.db.prepare(`
        INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price, vat_amount, discount_applied)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of transaction.items) {
        itemStmt.run(
          uuidv4(),
          id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.vat_amount || 0,
          item.discount_applied || 0
        );
      }
      
      return { id, ...transaction };
    });

    try {
      return dbTransaction();
    } catch (error) {
      throw new Error(`Database transaction failed: ${error.message}`);
    }
  }

  // List transactions with their items (paginated)
  async listTransactions(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const txs = this.db.prepare(`
      SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ? OFFSET ?
    `).all(limit, offset);
    // Get all transaction ids
    const ids = txs.map(tx => tx.id);
    let items = [];
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      items = this.db.prepare(`
        SELECT * FROM transaction_items WHERE transaction_id IN (${placeholders})
      `).all(...ids);
    }
    // Group items by transaction_id
    const itemsByTx = {};
    for (const item of items) {
      if (!itemsByTx[item.transaction_id]) itemsByTx[item.transaction_id] = [];
      itemsByTx[item.transaction_id].push(item);
    }
    // Attach items to transactions
    return txs.map(tx => ({ ...tx, items: itemsByTx[tx.id] || [] }));
  }

  // Get a single transaction with its items
  async getTransactionById(id) {
    const tx = this.db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!tx) throw new Error('Transaction not found');
    const items = this.db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(id);
    return { ...tx, items };
  }
}

module.exports = TransactionService; 