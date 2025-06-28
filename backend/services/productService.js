class ProductService {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.lastCacheUpdate = 0;
  }

  // Optimized list with pagination
  async listProducts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Use prepared statements for better performance
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY name LIMIT ? OFFSET ?');
    const products = stmt.all(limit, offset);
    
    // Get total count for pagination
    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM products');
    const { total } = countStmt.get();
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Cached product list for frequently accessed data
  async getCachedProducts() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.has('products') && (now - this.lastCacheUpdate) < this.cacheTimeout) {
      return this.cache.get('products');
    }
    
    // Fetch fresh data
    const result = await this.listProducts(1, 50); // Cache first 50 products
    this.cache.set('products', result);
    this.lastCacheUpdate = now;
    
    return result;
  }

  // Search products with index optimization
  async searchProducts(query, limit = 20) {
    if (!query || query.trim().length < 2) {
      return { products: [], pagination: { total: 0 } };
    }
    
    const searchTerm = `%${query.trim()}%`;
    const stmt = this.db.prepare(`
      SELECT * FROM products 
      WHERE name LIKE ? OR id LIKE ? 
      ORDER BY name 
      LIMIT ?
    `);
    
    const products = stmt.all(searchTerm, searchTerm, limit);
    return { products, pagination: { total: products.length } };
  }

  // Optimized add with minimal validation
  async addProduct(product) {
    const { name, price, stock } = product;
    
    // Quick validation
    if (!name?.trim() || price <= 0 || stock < 0) {
      throw new Error('Invalid product data');
    }

    const stmt = this.db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
    const info = stmt.run(name.trim(), price, stock);
    
    // Invalidate cache
    this.cache.delete('products');
    
    return { id: info.lastInsertRowid, name: name.trim(), price, stock };
  }

  // Optimized update
  async updateProduct(product) {
    const { id, name, price, stock } = product;
    
    if (!id || !name?.trim() || price <= 0 || stock < 0) {
      throw new Error('Invalid product data');
    }

    const stmt = this.db.prepare('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?');
    const result = stmt.run(name.trim(), price, stock, id);
    
    if (result.changes === 0) {
      throw new Error('Product not found');
    }
    
    // Invalidate cache
    this.cache.delete('products');
    
    return { id, name: name.trim(), price, stock };
  }

  // Optimized get by ID with caching
  async getProductById(id) {
    const cacheKey = `product_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const product = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Cache for 5 minutes
    this.cache.set(cacheKey, product);
    setTimeout(() => this.cache.delete(cacheKey), 300000);
    
    return product;
  }

  // Batch stock update for better performance
  async updateStockBatch(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return;
    }
    
    const transaction = this.db.transaction(() => {
      const stmt = this.db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
      
      for (const { id, qty } of updates) {
        const result = stmt.run(qty, id, qty);
        if (result.changes === 0) {
          throw new Error(`Insufficient stock for product ${id}`);
        }
      }
    });
    
    try {
      transaction();
      // Invalidate cache
      this.cache.delete('products');
    } catch (error) {
      throw new Error(`Stock update failed: ${error.message}`);
    }
  }

  // Memory cleanup
  clearCache() {
    this.cache.clear();
  }

  // Get low stock products for alerts
  async getLowStockProducts(threshold = 5) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE stock <= ? ORDER BY stock ASC');
    return stmt.all(threshold);
  }
}

module.exports = ProductService;
