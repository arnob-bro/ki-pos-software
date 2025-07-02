// Product model definition (for reference and validation)

/**
 * @typedef {Object} Product
 * @property {number} id - Unique identifier (autoincrement)
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {number} stock - Product stock quantity
 */

const ProductModel = {
  id: 'number',
  name: 'string',
  price: 'number',
  stock: 'number',
};

module.exports = ProductModel; 