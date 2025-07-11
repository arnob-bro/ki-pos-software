const Database = require('better-sqlite3');
const path = require('path');

// Test database functionality
async function testDatabase() {
  console.log('Testing database functionality...');
  
  const dbPath = path.join(__dirname, 'pos.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  
  try {
    // Check if tables exist
    console.log('\nChecking tables...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables found:', tables.map(t => t.name));
    
    // Check if users exist
    console.log('\nChecking users...');
    const users = db.prepare('SELECT * FROM users LIMIT 5').all();
    console.log('Users found:', users.length);
    
    // Check if products exist
    console.log('\nChecking products...');
    const products = db.prepare('SELECT * FROM products LIMIT 5').all();
    console.log('Products found:', products.length);
    
    // Check if transactions table exists and is empty
    console.log('\nChecking transactions...');
    const transactions = db.prepare('SELECT * FROM transactions LIMIT 5').all();
    console.log('Transactions found:', transactions.length);
    
    // Check if transaction_items table exists
    console.log('\nChecking transaction_items...');
    const transactionItems = db.prepare('SELECT * FROM transaction_items LIMIT 5').all();
    console.log('Transaction items found:', transactionItems.length);
    
    // Try to add a test transaction
    if (users.length > 0 && products.length > 0) {
      console.log('\nTesting transaction insertion...');
      
      const testTransaction = {
        user_id: users[0].id,
        payment_method: 'cash',
        total_amount: 10.00,
        vat_amount: 0.50,
        discount_amount: 0,
        items: [{
          product_id: products[0].id,
          quantity: 1,
          unit_price: 10.00,
          vat_amount: 0.50,
          discount_applied: 0
        }]
      };
      
      console.log('Test transaction data:', JSON.stringify(testTransaction, null, 2));
      
      // Use the same transaction logic as the service
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();
      
      const dbTransaction = db.transaction(() => {
        const stmt = db.prepare(`
          INSERT INTO transactions (id, user_id, customer_id, shift_id, payment_method, total_amount, vat_amount, discount_amount, tse_signature)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const transactionResult = stmt.run(
          id,
          testTransaction.user_id,
          null, // customer_id
          null, // shift_id
          testTransaction.payment_method,
          testTransaction.total_amount,
          testTransaction.vat_amount,
          testTransaction.discount_amount,
          null // tse_signature
        );
        console.log('Transaction inserted, changes:', transactionResult.changes);
        
        // Insert items
        const itemStmt = db.prepare(`
          INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price, vat_amount, discount_applied)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const item of testTransaction.items) {
          const itemId = uuidv4();
          const itemResult = itemStmt.run(
            itemId,
            id,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.vat_amount,
            item.discount_applied
          );
          console.log('Item inserted with ID:', itemId, 'changes:', itemResult.changes);
        }
        
        return { id, ...testTransaction };
      });
      
      const result = dbTransaction();
      console.log('Test transaction completed successfully:', result.id);
      
      // Verify the transaction was added
      const newTransactions = db.prepare('SELECT * FROM transactions WHERE id = ?').all(id);
      console.log('New transaction found:', newTransactions.length);
      
      const newItems = db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(id);
      console.log('New transaction items found:', newItems.length);
      
    } else {
      console.log('Cannot test transaction - missing users or products');
    }
    
  } catch (error) {
    console.error('Database test failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    db.close();
  }
}

testDatabase(); 