// Customer model definition (for reference and validation)

/**
 * @typedef {Object} Customer
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Customer name
 * @property {string} phone - Customer phone number
 * @property {string} email - Customer email
 * @property {string} address - Customer address
 * @property {number} loyalty_points - Loyalty points
 * @property {string} loyalty_tier - Loyalty tier (Silver, Gold, Platinum, etc.)
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Update timestamp
 */

const CustomerModel = {
    id: "string",
    name: "string",
    phone: "string",
    email: "string",
    address: "string",
    loyalty_points: "number",
    loyalty_tier: "string",
    created_at: "string",
    updated_at: "string",
}

module.exports = CustomerModel
