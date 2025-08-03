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

	async listProductCategories() {
		try {
			return await this.productService.listProductCategories();
		} catch (error) {
			throw new Error(`Failed to list product categories: ${error.message}`);
		}
	}

	async addProduct(productData, currentUser) {
		try {
			// Additional validation if needed
			if (!productData.name || productData.name.trim().length === 0) {
				throw new Error("Product name cannot be empty");
			}

			const product = {
				name: productData.name.trim(),
				category_id: productData.category_id,
				barcode: productData.barcode,
				price: parseFloat(productData.price),
				vat_rate: parseFloat(productData.vat_rate || 0),
				stock_quantity: parseInt(productData.stock_quantity || 0, 10),
			};

			return await this.productService.addProduct(product, currentUser);
		} catch (error) {
			throw new Error(`Failed to add product: ${error.message}`);
		}
	}

	async updateProduct(productData, currentUser) {
		try {
			if (!productData.id) {
				throw new Error("Product ID is required for update");
			}

			if (!productData.name || productData.name.trim().length === 0) {
				throw new Error("Product name cannot be empty");
			}

			const product = {
				id: productData.id, // keep as string if that's your schema
				name: productData.name.trim(),
				category_id: productData.category_id,
				barcode: productData.barcode,
				price: parseFloat(productData.price),
				vat_rate: parseFloat(productData.vat_rate || 0),
				stock_quantity: parseInt(productData.stock_quantity || 0, 10),
			};

			return await this.productService.updateProduct(product, currentUser);
		} catch (error) {
			throw new Error(`Failed to update product: ${error.message}`);
		}
	}

	async getProductById(id) {
		try {
			// id is string in your schema
			return await this.productService.getProductById(id);
		} catch (error) {
			throw new Error(`Failed to get product: ${error.message}`);
		}
	}

	async deleteProduct(id, currentUser) {
		try {
			if (!id) {
				throw new Error("Product ID is required for deletion");
			}
			return await this.productService.deleteProduct(id, currentUser);
		} catch (error) {
			throw new Error(`Failed to delete product: ${error.message}`);
		}
	}
}

module.exports = ProductController;
