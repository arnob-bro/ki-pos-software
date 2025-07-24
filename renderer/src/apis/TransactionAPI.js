// TransactionAPI.js

class TransactionAPI {
  constructor(backend = window.posAPI) {
    this.backend = backend;
  }
  addTransaction(transactionData, user) {
    return this.backend.addTransaction(transactionData, user);
  }
}

const transactionAPI = new TransactionAPI();
export default transactionAPI;
