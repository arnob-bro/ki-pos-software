// ProductAPI.js

class ProductAPI {
  constructor(backend = window.posAPI) {
    this.backend = backend;
  }
  listProducts(page = 1, limit = 50) {
    return this.backend.listProducts(page, limit);
  }
  searchProducts(term, limit = 50) {
    return this.backend.searchProducts(term, limit);
  }
  addProduct(product, user) {
    return this.backend.addProduct(product, user);
  }
  updateProduct(product, user) {
    return this.backend.updateProduct(product, user);
  }
  deleteProduct(id, user) {
    return this.backend.deleteProduct(id, user);
  }
  listProductCategories() {
    return this.backend.listProductCategories();
  }
}

const productAPI = new ProductAPI();
export default productAPI;
