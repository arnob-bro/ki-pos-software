class SaleService {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute for sales data
  }

  // Optimized add sale with batch operations
  async addSale(sale) {
    const { items, total } = sale;
    
    // Quick validation
    if (!items?.length || total <= 0) {
      throw new Error('Invalid sale data');
    }

    // Validate items quickly
    for (const item of items) {
      if (!item.id || !item.name || item.price <= 0 || item.qty <= 0) {
        throw new Error('Invalid item data');
      }
    }

    // Calculate total to verify
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (Math.abs(calculatedTotal - total) > 0.01) {
      throw new Error('Total mismatch');
    }

    // Optimized transaction
    const transaction = this.db.transaction(() => {
      // Insert sale
      const stmt = this.db.prepare('INSERT INTO sales (items, total) VALUES (?, ?)');
      const info = stmt.run(JSON.stringify(items), total);
      
      // Batch stock update
      const updateStock = this.db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
      
      for (const item of items) {
        const result = updateStock.run(item.qty, item.id, item.qty);
        if (result.changes === 0) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
      }
      
      return { id: info.lastInsertRowid, items, total };
    });

    try {
      const result = transaction();
      // Clear sales cache
      this.cache.delete('sales_list');
      return result;
    } catch (error) {
      throw new Error(`Sale failed: ${error.message}`);
    }
  }

  // Paginated sales list for memory efficiency
  async listSales(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Use prepared statements
    const stmt = this.db.prepare(`
      SELECT * FROM sales 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const sales = stmt.all(limit, offset);
    
    // Get total count
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM sales');
    const { total } = countStmt.get();
    
    // Parse JSON items
    const parsedSales = sales.map(sale => ({
      ...sale,
      items: JSON.parse(sale.items)
    }));
    
    return {
      sales: parsedSales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Cached recent sales
  async getRecentSales(limit = 10) {
    const cacheKey = `recent_sales_${limit}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const stmt = this.db.prepare(`
      SELECT * FROM sales 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const sales = stmt.all(limit);
    const parsedSales = sales.map(sale => ({
      ...sale,
      items: JSON.parse(sale.items)
    }));
    
    // Cache for 30 seconds
    this.cache.set(cacheKey, parsedSales);
    setTimeout(() => this.cache.delete(cacheKey), 30000);
    
    return parsedSales;
  }

  // Optimized get by ID with caching
  async getSaleById(id) {
    const cacheKey = `sale_${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const sale = this.db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    const parsedSale = {
      ...sale,
      items: JSON.parse(sale.items)
    };
    
    // Cache for 5 minutes
    this.cache.set(cacheKey, parsedSale);
    setTimeout(() => this.cache.delete(cacheKey), 300000);
    
    return parsedSale;
  }

  // Optimized date range query with pagination
  async getSalesByDateRange(startDate, endDate, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const stmt = this.db.prepare(`
      SELECT * FROM sales 
      WHERE DATE(created_at) BETWEEN ? AND ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const sales = stmt.all(startDate, endDate, limit, offset);
    
    // Get total count for range
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM sales 
      WHERE DATE(created_at) BETWEEN ? AND ?
    `);
    const { total } = countStmt.get(startDate, endDate);
    
    const parsedSales = sales.map(sale => ({
      ...sale,
      items: JSON.parse(sale.items)
    }));
    
    return {
      sales: parsedSales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Quick sales summary for dashboard
  async getSalesSummary() {
    const cacheKey = 'sales_summary';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Today's sales
    const todayStmt = this.db.prepare(`
      SELECT COUNT(*) as count, SUM(total) as total 
      FROM sales 
      WHERE DATE(created_at) = ?
    `);
    const todaySales = todayStmt.get(today);
    
    // This month's sales
    const monthStmt = this.db.prepare(`
      SELECT COUNT(*) as count, SUM(total) as total 
      FROM sales 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);
    const monthSales = monthStmt.get();
    
    const summary = {
      today: {
        count: todaySales.count || 0,
        total: todaySales.total || 0
      },
      month: {
        count: monthSales.count || 0,
        total: monthSales.total || 0
      }
    };
    
    // Cache for 5 minutes
    this.cache.set(cacheKey, summary);
    setTimeout(() => this.cache.delete(cacheKey), 300000);
    
    return summary;
  }

  // Memory cleanup
  clearCache() {
    this.cache.clear();
  }

  // Get top selling products
  async getTopSellingProducts(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT 
        json_extract(items, '$[*].name') as names,
        json_extract(items, '$[*].qty') as quantities
      FROM sales 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    
    const sales = stmt.all();
    const productStats = new Map();
    
    for (const sale of sales) {
      try {
        const items = JSON.parse(sale.items);
        for (const item of items) {
          const current = productStats.get(item.name) || 0;
          productStats.set(item.name, current + item.qty);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    
    return Array.from(productStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, qty]) => ({ name, qty }));
  }
}

module.exports = SaleService; 