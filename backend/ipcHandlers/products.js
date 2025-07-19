const ProductService = require('../services/productService');
const ProductController = require('../controllers/productController');

module.exports = function registerProductHandlers(ipcMain, db) {
  const productService = new ProductService(db);
  const productController = new ProductController(productService);

  ipcMain.handle('products:list', async (event, page = 1, limit = 20) => {
    try {
      return await productService.listProducts(page, limit);
    } catch (error) {
      console.error('Error listing products:', error.message);
      throw error;
    }
  });

  ipcMain.handle('products:search', async (event, query, limit = 20) => {
    try {
      return await productService.searchProducts(query, limit);
    } catch (error) {
      console.error('Error searching products:', error.message);
      throw error;
    }
  });

  ipcMain.handle('products:add', async (event, product, currentUser) => {
    try {
      return await productController.addProduct(product, currentUser);
    } catch (error) {
      console.error('Error adding product:', error.message);
      throw error;
    }
  });

  ipcMain.handle('products:update', async (event, product, currentUser) => {
    try {
      return await productController.updateProduct(product, currentUser);
    } catch (error) {
      console.error('Error updating product:', error.message);
      throw error;
    }
  });

  ipcMain.handle('products:delete', async (event, id, currentUser) => {
    try {
      return await productController.deleteProduct(id, currentUser);
    } catch (error) {
      console.error('Error deleting product:', error.message);
      throw error;
    }
  });

  ipcMain.handle('products:get', async (event, id) => {
    try {
      return await productController.getProductById(id);
    } catch (error) {
      console.error('Error getting product:', error.message);
      throw error;
    }
  });

  ipcMain.handle('products:getLowStock', async (event, threshold = 5) => {
    try {
      return await productService.getLowStockProducts(threshold);
    } catch (error) {
      console.error('Error getting low stock products:', error.message);
      throw error;
    }
  });

  ipcMain.handle('productCategories:list', async (event) => {
    try {
      return await productService.listProductCategories();
    } catch (error) {
      console.error('Error getting list of product categories:', error.message);
      throw error;
    }
  });
}; 