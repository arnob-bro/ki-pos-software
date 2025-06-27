//sample code for now

module.exports = function registerSalesHandlers(ipcMain, db) {
  ipcMain.handle('sales:add', (event, sale) => {
    // sale: { items: [{id, name, price, qty}], total }
    const stmt = db.prepare('INSERT INTO sales (items, total) VALUES (?, ?)');
    const info = stmt.run(JSON.stringify(sale.items), sale.total);
    // Update stock
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    sale.items.forEach(item => {
      updateStock.run(item.qty, item.id);
    });
    return { id: info.lastInsertRowid, ...sale };
  });
  ipcMain.handle('sales:list', () => {
    const sales = db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all();
    return sales.map(sale => ({ ...sale, items: JSON.parse(sale.items) }));
  });
}; 