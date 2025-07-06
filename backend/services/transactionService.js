const { v4: uuidv4 } = require('uuid');

// Simple LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

class TransactionService {
  constructor(db) {
    this.db = db;
    this.receiptCache = new LRUCache(50); // Cache last 50 receipt queries
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Add a transaction and its items
  async addTransaction(transaction) {
    console.log('DEBUG: TransactionService.addTransaction called with:', JSON.stringify(transaction, null, 2));
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
      console.log('DEBUG: Starting database transaction with ID:', id);
      
      const stmt = this.db.prepare(`
        INSERT INTO transactions (id, user_id, customer_id, shift_id, payment_method, total_amount, vat_amount, discount_amount, tse_signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const transactionResult = stmt.run(
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
      console.log('DEBUG: Transaction record inserted, changes:', transactionResult.changes);
      
      // Insert items and update stock
      const itemStmt = this.db.prepare(`
        INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price, vat_amount, discount_applied)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Prepare stock update statement
      const updateStockStmt = this.db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?
      `);
      
      for (const item of transaction.items) {
        console.log('DEBUG: Processing item:', item);
        
        // Insert transaction item
        const itemId = uuidv4();
        const itemResult = itemStmt.run(
          itemId,
          id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.vat_amount || 0,
          item.discount_applied || 0
        );
        console.log('DEBUG: Item inserted with ID:', itemId, 'changes:', itemResult.changes);
        
        // Update product stock
        const stockResult = updateStockStmt.run(item.quantity, item.product_id, item.quantity);
        console.log('DEBUG: Stock update for product', item.product_id, 'changes:', stockResult.changes);
        if (stockResult.changes === 0) {
          throw new Error(`Insufficient stock for product ${item.product_id}`);
        }
      }
      
      return { id, ...transaction };
    });

    try {
      const result = dbTransaction();
      console.log('DEBUG: Transaction completed successfully with ID:', result.id);
      
      // Clear receipt cache when new transaction is added
      this.clearReceiptCache();
      
      return result;
    } catch (error) {
      console.error('DEBUG: Transaction failed with error:', error.message);
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

  // Get receipts with filters and join with user data - OPTIMIZED
  async getReceipts(filters = {}) {
    const limit = filters.limit || 50; // Default limit to prevent memory issues
    const offset = filters.offset || 0;
    
    // Create cache key from filters
    const cacheKey = JSON.stringify({ ...filters, limit, offset });
    
    // Check cache first
    const cached = this.receiptCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    
    // Use prepared statements for better performance
    let query = `
      SELECT 
        t.id,
        t.timestamp,
        t.payment_method,
        t.total_amount,
        t.vat_amount,
        t.discount_amount,
        u.name as operator_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Apply filters with indexed columns first
    if (filters.date) {
      query += ` AND DATE(t.timestamp) = ?`;
      params.push(filters.date);
    }
    
    if (filters.id) {
      query += ` AND t.id LIKE ?`;
      params.push(`%${filters.id}%`);
    }
    
    if (filters.operator) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${filters.operator}%`);
    }
    
    // Use indexed timestamp for ordering
    query += ` ORDER BY t.timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const stmt = this.db.prepare(query);
    const transactions = stmt.all(...params);
    
    // Batch fetch items for all transactions at once
    if (transactions.length === 0) {
      return [];
    }
    
    const transactionIds = transactions.map(tx => tx.id);
    const placeholders = transactionIds.map(() => '?').join(',');
    
    const itemsQuery = `
      SELECT 
        ti.transaction_id,
        ti.quantity,
        ti.unit_price,
        p.name as product_name
      FROM transaction_items ti
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id IN (${placeholders})
      ORDER BY ti.transaction_id
    `;
    
    const itemsStmt = this.db.prepare(itemsQuery);
    const allItems = itemsStmt.all(...transactionIds);
    
    // Group items by transaction_id using Map for O(1) lookup
    const itemsMap = new Map();
    for (const item of allItems) {
      if (!itemsMap.has(item.transaction_id)) {
        itemsMap.set(item.transaction_id, []);
      }
      itemsMap.get(item.transaction_id).push({
        name: item.product_name || 'Unknown Product',
        qty: item.quantity,
        price: item.unit_price
      });
    }
    
    // Build receipts array with O(1) item lookup
    const receipts = transactions.map(tx => ({
      id: tx.id,
      date: tx.timestamp.split(' ')[0],
      operator: tx.operator_name || 'Unknown',
      total: tx.total_amount,
      tax: tx.vat_amount,
      payment_method: tx.payment_method,
      items: itemsMap.get(tx.id) || []
    }));
    
    // Cache the result
    this.receiptCache.set(cacheKey, {
      data: receipts,
      timestamp: Date.now()
    });
    
    return receipts;
  }

  // Clear cache when new transactions are added
  clearReceiptCache() {
    this.receiptCache.clear();
  }
}

module.exports = TransactionService; 