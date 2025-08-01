const CustomerService = require("../services/customerService")
const CustomerController = require("../controllers/customerController")
const AuditLogService = require("../services/auditLogService")

module.exports = function registerCustomerHandlers(ipcMain, db) {
    const auditLogService = new AuditLogService(db)
    const customerService = new CustomerService(db, auditLogService)
    const customerController = new CustomerController(customerService)

    ipcMain.handle("customers:list", async (event, page = 1, limit = 20) => {
        return await customerController.listCustomers(page, limit)
    })

    ipcMain.handle("customers:get", async (event, id) => {
        return await customerController.getCustomerById(id)
    })

    ipcMain.handle("customers:add", async (event, customerData, user) => {
        return await customerController.addCustomer(customerData, user)
    })

    ipcMain.handle("customers:update", async (event, customerData, user) => {
        return await customerController.updateCustomer(customerData, user)
    })

    ipcMain.handle("customers:delete", async (event, id, user) => {
        // Only allow admin to delete
        if (!user || user.role_id !== 1) {
            throw new Error("Only admin can delete customers")
        }
        return await customerController.deleteCustomer(id, user)
    })

    ipcMain.handle("customers:assignLoyaltyTier", async (event, id, tier, user) => {
        return await customerController.assignLoyaltyTier(id, tier, user)
    })

    ipcMain.handle("customers:getHistory", async (event, id) => {
        return await customerController.getCustomerHistory(id)
    })
}
