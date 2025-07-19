const AuditLogService = require('./auditLogService');

class ProductService {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.lastCacheUpdate = 0;
    this.auditLogService = new AuditLogService(db);
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

  // list of categories
  async listProductCategories() {
    // Use prepared statements for better performance
    const stmt = this.db.prepare('SELECT * FROM categories ORDER BY id');
    const categories = stmt.all();
    
    return {
      categories
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
  async addProduct(product, currentUser) {
    console.log('DEBUG: Received product for addProduct:', product);
    // Inline validation with coercion
    const stockQty = Number(product.stock_quantity || 0);
    const price = Number(product.price);
    const vatRate = Number(product.vat_rate || 0);
    const categoryId = product.category_id ? Number(product.category_id) : null;
    
    if (typeof product.name !== 'string' || !product.name.trim()) throw new Error('Invalid name');
    if (isNaN(price) || price <= 0) throw new Error('Invalid price');
    if (isNaN(stockQty) || stockQty < 0) throw new Error('Invalid stock_quantity');
    if (isNaN(vatRate) || vatRate < 0) throw new Error('Invalid vat_rate');
    
    const { v4: uuidv4 } = require('uuid');
    const stmt = this.db.prepare('INSERT INTO products (id, name, category_id, barcode, price, vat_rate, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const id = product.id || uuidv4();
    stmt.run(id, product.name.trim(), categoryId, product.barcode || null, price, vatRate, stockQty);
    this.cache.delete('products');
    const newProduct = { 
      id, 
      name: product.name.trim(), 
      category_id: categoryId,
      barcode: product.barcode || null,
      price, 
      vat_rate: vatRate,
      stock_quantity: stockQty 
    };
    if (currentUser) {
      await this.auditLogService.log({
        user_id: currentUser.id,
        action_type: 'CREATE',
        table_name: 'products',
        record_id: id,
        old_data: null,
        new_data: newProduct
      });
    }
    return newProduct;
  }

  // Optimized update
  async updateProduct(product, currentUser) {
    // Inline validation with coercion
    const stockQty = Number(product.stock_quantity || 0);
    const price = Number(product.price);
    const vatRate = Number(product.vat_rate || 0);
    const categoryId = product.category_id ? Number(product.category_id) : null;
    
    if (typeof product.id !== 'string' || !product.id) throw new Error('Invalid id');
    if (typeof product.name !== 'string' || !product.name.trim()) throw new Error('Invalid name');
    if (isNaN(price) || price <= 0) throw new Error('Invalid price');
    if (isNaN(stockQty) || stockQty < 0) throw new Error('Invalid stock_quantity');
    if (isNaN(vatRate) || vatRate < 0) throw new Error('Invalid vat_rate');
    
    const stmt = this.db.prepare('UPDATE products SET name = ?, category_id = ?, barcode = ?, price = ?, vat_rate = ?, stock_quantity = ? WHERE id = ?');
    const oldProduct = await this.getProductById(product.id);
    const result = stmt.run(product.name.trim(), categoryId, product.barcode || null, price, vatRate, stockQty, product.id);
    if (result.changes === 0) {
      throw new Error('Product not found');
    }
    this.cache.delete('products');
    const updatedProduct = { 
      id: product.id, 
      name: product.name.trim(), 
      category_id: categoryId,
      barcode: product.barcode || null,
      price, 
      vat_rate: vatRate,
      stock_quantity: stockQty 
    };
    if (currentUser) {
      await this.auditLogService.log({
        user_id: currentUser.id,
        action_type: 'UPDATE',
        table_name: 'products',
        record_id: product.id,
        old_data: oldProduct,
        new_data: updatedProduct
      });
    }
    return updatedProduct;
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
      const stmt = this.db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?');
      
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
    const stmt = this.db.prepare('SELECT * FROM products WHERE stock_quantity <= ? ORDER BY stock_quantity ASC');
    return stmt.all(threshold);
  }

  // Delete product
  async deleteProduct(id, currentUser) {
    if (typeof id !== 'string' || !id) {
      throw new Error('Invalid product ID');
    }
    const oldProduct = await this.getProductById(id);
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Product not found');
    }
    
    // Clear cache
    this.cache.delete('products');
    this.cache.delete(`product_${id}`);
    if (currentUser) {
      await this.auditLogService.log({
        user_id: currentUser.id,
        action_type: 'DELETE',
        table_name: 'products',
        record_id: id,
        old_data: oldProduct,
        new_data: null
      });
    }
    return { success: true, message: 'Product deleted successfully' };
  }
}

module.exports = ProductService;
