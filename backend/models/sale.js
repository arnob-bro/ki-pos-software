// Sale model definition (for reference and validation)

/**
 * @typedef {Object} Sale
 * @property {number} id - Unique identifier (autoincrement)
 * @property {Array<{id: number, name: string, price: number, qty: number}>} items - Array of sold items
 * @property {number} total - Total sale amount
 * @property {string} created_at - Sale date/time (ISO string)
 */

const SaleModel = {
	id: "number",
	items: [
		{
			id: "number",
			name: "string",
			price: "number",
			qty: "number",
		},
	],
	total: "number",
	created_at: "string",
};

module.exports = SaleModel;
