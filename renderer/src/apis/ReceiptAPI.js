// ReceiptAPI.js

class ReceiptAPI {
  constructor(backend = window.posAPI) {
    this.backend = backend;
  }
  getReceipts(filters = {}, limit = 50, offset = 0) {
    return this.backend.getReceipts({ ...filters, limit, offset });
  }
}

const receiptAPI = new ReceiptAPI();
export default receiptAPI;
