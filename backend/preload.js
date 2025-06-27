//sample code for now

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posAPI', {
  // Products
  listProducts: () => ipcRenderer.invoke('products:list'),
  addProduct: (product) => ipcRenderer.invoke('products:add', product),
  updateProduct: (product) => ipcRenderer.invoke('products:update', product),
  // Sales
  addSale: (sale) => ipcRenderer.invoke('sales:add', sale),
  listSales: () => ipcRenderer.invoke('sales:list'),
}); 