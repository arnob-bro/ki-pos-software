const SaleService = require("../services/saleService");
const ProductService = require("../services/productService");
const SaleController = require("../controllers/saleController");

module.exports = function registerSalesHandlers(ipcMain, db) {
	const saleService = new SaleService(db);
	const productService = new ProductService(db);
	const saleController = new SaleController(saleService, productService);

	ipcMain.handle("sales:add", async (event, sale, currentUser) => {
		try {
			return await saleController.addSale(sale, currentUser);
		} catch (error) {
			console.error("Error adding sale:", error.message);
			throw error;
		}
	});

	ipcMain.handle("sales:list", async (event, page = 1, limit = 20) => {
		try {
			return await saleService.listSales(page, limit);
		} catch (error) {
			console.error("Error listing sales:", error.message);
			throw error;
		}
	});

	ipcMain.handle("sales:get", async (event, id) => {
		try {
			return await saleController.getSaleById(id);
		} catch (error) {
			console.error("Error getting sale:", error.message);
			throw error;
		}
	});

	ipcMain.handle(
		"sales:getByDateRange",
		async (event, startDate, endDate, page = 1, limit = 20) => {
			try {
				return await saleService.getSalesByDateRange(
					startDate,
					endDate,
					page,
					limit
				);
			} catch (error) {
				console.error("Error getting sales by date range:", error.message);
				throw error;
			}
		}
	);

	ipcMain.handle("sales:getSummary", async () => {
		try {
			return await saleService.getSalesSummary();
		} catch (error) {
			console.error("Error getting sales summary:", error.message);
			throw error;
		}
	});

	ipcMain.handle("sales:getRecent", async (event, limit = 10) => {
		try {
			return await saleService.getRecentSales(limit);
		} catch (error) {
			console.error("Error getting recent sales:", error.message);
			throw error;
		}
	});

	ipcMain.handle("sales:getTopSelling", async (event, limit = 10) => {
		try {
			return await saleService.getTopSellingProducts(limit);
		} catch (error) {
			console.error("Error getting top selling products:", error.message);
			throw error;
		}
	});
};
