//sample code for now

module.exports = function registerProductHandlers(ipcMain, db) {
  ipcMain.handle('products:list', () => {
    return db.prepare('SELECT * FROM products').all();
  });
  ipcMain.handle('products:add', (event, product) => {
    const stmt = db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
    const info = stmt.run(product.name, product.price, product.stock);
    return { id: info.lastInsertRowid, ...product };
  });
  ipcMain.handle('products:update', (event, product) => {
    const stmt = db.prepare('UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?');
    stmt.run(product.name, product.price, product.stock, product.id);
    return product;
  });
}; 