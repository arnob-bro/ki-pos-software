// InventoryAPI.js

class InventoryAPI {
  constructor(backend = window.posAPI) {
    this.backend = backend;
  }
  getAuditLogs(page = 1, limit = 10) {
    return this.backend.getAuditLogs(page, limit);
  }
}

const inventoryAPI = new InventoryAPI();
export default inventoryAPI;
