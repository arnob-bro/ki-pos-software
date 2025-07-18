class CustomerController {
    constructor(customerService) {
        this.customerService = customerService
    }

    async listCustomers(page = 1, limit = 20) {
        try {
            return await this.customerService.listCustomers(page, limit)
        } catch (error) {
            throw new Error(`Failed to list customers: ${error.message}`)
        }
    }

    async getCustomerById(id) {
        try {
            return await this.customerService.getCustomerById(id)
        } catch (error) {
            throw new Error(`Failed to get customer: ${error.message}`)
        }
    }

    async addCustomer(customerData) {
        try {
            if (!customerData.name || customerData.name.trim().length === 0) {
                throw new Error("Customer name cannot be empty")
            }
            return await this.customerService.addCustomer(customerData)
        } catch (error) {
            throw new Error(`Failed to add customer: ${error.message}`)
        }
    }

    async updateCustomer(customerData) {
        try {
            if (!customerData.id) {
                throw new Error("Customer ID is required for update")
            }
            if (!customerData.name || customerData.name.trim().length === 0) {
                throw new Error("Customer name cannot be empty")
            }
            return await this.customerService.updateCustomer(customerData)
        } catch (error) {
            throw new Error(`Failed to update customer: ${error.message}`)
        }
    }

    async deleteCustomer(id) {
        try {
            if (!id) {
                throw new Error("Customer ID is required for deletion")
            }
            return await this.customerService.deleteCustomer(id)
        } catch (error) {
            throw new Error(`Failed to delete customer: ${error.message}`)
        }
    }

    async assignLoyaltyTier(id, tier) {
        try {
            if (!id) {
                throw new Error(
                    "Customer ID is required for assigning loyalty tier"
                )
            }
            if (!tier) {
                throw new Error("Loyalty tier is required")
            }
            return await this.customerService.assignLoyaltyTier(id, tier)
        } catch (error) {
            throw new Error(`Failed to assign loyalty tier: ${error.message}`)
        }
    }

    async getCustomerHistory(id) {
        try {
            if (!id) {
                throw new Error("Customer ID is required for history")
            }
            return await this.customerService.getCustomerHistory(id)
        } catch (error) {
            throw new Error(`Failed to get customer history: ${error.message}`)
        }
    }
}

module.exports = CustomerController
