class CustomerService {
    constructor(db) {
        this.db = db
        this.cache = new Map()
        this.cacheTimeout = 30000 // 30 seconds
        this.lastCacheUpdate = 0
    }

    // List customers with pagination
    async listCustomers(page = 1, limit = 20) {
        const offset = (page - 1) * limit
        const stmt = this.db.prepare(
            "SELECT * FROM customers ORDER BY name LIMIT ? OFFSET ?"
        )
        const customers = stmt.all(limit, offset)
        const countStmt = this.db.prepare(
            "SELECT COUNT(*) as total FROM customers"
        )
        const { total } = countStmt.get()
        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    // Get customer by ID
    async getCustomerById(id) {
        const cacheKey = `customer_${id}`
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)
        }
        const customer = this.db
            .prepare("SELECT * FROM customers WHERE id = ?")
            .get(id)
        if (!customer) {
            throw new Error("Customer not found")
        }
        this.cache.set(cacheKey, customer)
        setTimeout(() => this.cache.delete(cacheKey), 300000)
        return customer
    }

    // Add customer
    async addCustomer(customer) {
        const { v4: uuidv4 } = require("uuid")
        if (typeof customer.name !== "string" || !customer.name.trim())
            throw new Error("Invalid name")
        // Check for existing phone number (if provided)
        if (customer.phone && customer.phone.trim()) {
            const existing = this.db
                .prepare("SELECT id FROM customers WHERE phone = ?")
                .get(customer.phone.trim())
            if (existing) {
                throw new Error(
                    "A customer with this phone number already exists"
                )
            }
        }
        const id = customer.id || uuidv4()
        const stmt = this.db.prepare(
            "INSERT INTO customers (id, name, phone, email, address, loyalty_points, loyalty_tier) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        stmt.run(
            id,
            customer.name.trim(),
            customer.phone || null,
            customer.email || null,
            customer.address || null,
            Number(customer.loyalty_points) || 0,
            customer.loyalty_tier || null
        )
        this.cache.delete("customers")
        return { ...customer, id }
    }

    // Update customer
    async updateCustomer(customer) {
        if (typeof customer.id !== "string" || !customer.id)
            throw new Error("Invalid id")
        if (typeof customer.name !== "string" || !customer.name.trim())
            throw new Error("Invalid name")
        const stmt = this.db.prepare(
            "UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, loyalty_points = ?, loyalty_tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        const result = stmt.run(
            customer.name.trim(),
            customer.phone || null,
            customer.email || null,
            customer.address || null,
            Number(customer.loyalty_points) || 0,
            customer.loyalty_tier || null,
            customer.id
        )
        if (result.changes === 0) {
            throw new Error("Customer not found")
        }
        this.cache.delete("customers")
        this.cache.delete(`customer_${customer.id}`)
        return { ...customer }
    }

    // Delete customer
    async deleteCustomer(id) {
        if (typeof id !== "string" || !id) {
            throw new Error("Invalid customer ID")
        }
        const stmt = this.db.prepare("DELETE FROM customers WHERE id = ?")
        const result = stmt.run(id)
        if (result.changes === 0) {
            throw new Error("Customer not found")
        }
        this.cache.delete("customers")
        this.cache.delete(`customer_${id}`)
        return { success: true, message: "Customer deleted successfully" }
    }

    // Assign loyalty tier
    async assignLoyaltyTier(id, tier) {
        if (typeof id !== "string" || !id)
            throw new Error("Invalid customer ID")
        const stmt = this.db.prepare(
            "UPDATE customers SET loyalty_tier = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        const result = stmt.run(tier, id)
        if (result.changes === 0) {
            throw new Error("Customer not found")
        }
        this.cache.delete("customers")
        this.cache.delete(`customer_${id}`)
        return { id, loyalty_tier: tier }
    }

    // Get purchase history for a customer
    async getCustomerHistory(customerId) {
        // Get all transactions for this customer
        const txStmt = this.db.prepare(
            "SELECT * FROM transactions WHERE customer_id = ? ORDER BY timestamp DESC"
        )
        const transactions = txStmt.all(customerId)
        if (transactions.length === 0) return []
        // Get all transaction ids
        const ids = transactions.map((tx) => tx.id)
        const placeholders = ids.map(() => "?").join(",")
        // Get items for these transactions
        let items = []
        if (ids.length > 0) {
            const itemStmt = this.db.prepare(`
        SELECT ti.*, p.name as product_name
        FROM transaction_items ti
        LEFT JOIN products p ON ti.product_id = p.id
        WHERE ti.transaction_id IN (${placeholders})
      `)
            items = itemStmt.all(...ids)
        }
        // Group items by transaction_id
        const itemsByTx = {}
        for (const item of items) {
            if (!itemsByTx[item.transaction_id])
                itemsByTx[item.transaction_id] = []
            itemsByTx[item.transaction_id].push(item)
        }
        // Attach items to transactions
        return transactions.map((tx) => ({
            ...tx,
            items: itemsByTx[tx.id] || [],
        }))
    }

    // Memory cleanup
    clearCache() {
        this.cache.clear()
    }
}

module.exports = CustomerService
