class SaleController {
  constructor(saleService, productService) {
    this.saleService = saleService;
    this.productService = productService;
  }

  async addSale(saleData, currentUser) {
    try {
      // Validate sale data
      if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
        throw new Error('Sale must contain at least one item');
      }

      if (!saleData.total || saleData.total <= 0) {
        throw new Error('Sale total must be greater than 0');
      }

      // Validate and prepare items
      const validatedItems = [];
      for (const item of saleData.items) {
        if (!item.id || !item.name || !item.price || !item.qty) {
          throw new Error('Each item must have id, name, price, and qty');
        }

        // Validate quantity
        const qty = parseInt(item.qty, 10);
        if (isNaN(qty) || qty <= 0) {
          throw new Error(`Invalid quantity for ${item.name}`);
        }

        // Validate price
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0) {
          throw new Error(`Invalid price for ${item.name}`);
        }

        // Check stock availability
        try {
          const product = await this.productService.getProductById(item.id);
          if (product.stock < qty) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
          }
        } catch (error) {
          throw new Error(`Product not found: ${item.name}`);
        }

        validatedItems.push({
          id: parseInt(item.id, 10),
          name: item.name,
          price: price,
          qty: qty
        });
      }

      const sale = {
        items: validatedItems,
        total: parseFloat(saleData.total)
      };

      return await this.saleService.addSale(sale, currentUser);
    } catch (error) {
      throw new Error(`Failed to process sale: ${error.message}`);
    }
  }

  async listSales() {
    try {
      return await this.saleService.listSales();
    } catch (error) {
      throw new Error(`Failed to list sales: ${error.message}`);
    }
  }

  async getSaleById(id) {
    try {
      const saleId = parseInt(id, 10);
      if (isNaN(saleId)) {
        throw new Error('Invalid sale ID');
      }

      return await this.saleService.getSaleById(saleId);
    } catch (error) {
      throw new Error(`Failed to get sale: ${error.message}`);
    }
  }

  async getSalesByDateRange(startDate, endDate) {
    try {
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      if (start > end) {
        throw new Error('Start date cannot be after end date');
      }

      return await this.saleService.getSalesByDateRange(startDate, endDate);
    } catch (error) {
      throw new Error(`Failed to get sales by date range: ${error.message}`);
    }
  }
}

module.exports = SaleController; 