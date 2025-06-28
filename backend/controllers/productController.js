class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  async listProducts() {
    try {
      return await this.productService.listProducts();
    } catch (error) {
      throw new Error(`Failed to list products: ${error.message}`);
    }
  }

  async addProduct(productData) {
    try {
      // Additional validation if needed
      if (!productData.name || productData.name.trim().length === 0) {
        throw new Error('Product name cannot be empty');
      }

      const product = {
        name: productData.name.trim(),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock, 10)
      };

      return await this.productService.addProduct(product);
    } catch (error) {
      throw new Error(`Failed to add product: ${error.message}`);
    }
  }

  async updateProduct(productData) {
    try {
      if (!productData.id) {
        throw new Error('Product ID is required for update');
      }

      if (!productData.name || productData.name.trim().length === 0) {
        throw new Error('Product name cannot be empty');
      }

      const product = {
        id: parseInt(productData.id, 10),
        name: productData.name.trim(),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock, 10)
      };

      return await this.productService.updateProduct(product);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      const productId = parseInt(id, 10);
      if (isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      return await this.productService.getProductById(productId);
    } catch (error) {
      throw new Error(`Failed to get product: ${error.message}`);
    }
  }
}

module.exports = ProductController;
