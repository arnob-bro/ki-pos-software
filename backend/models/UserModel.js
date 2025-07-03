const {db} = require('../config/db');
console.log('Loaded db:', db); // Add this

function findUserById(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
  return stmt.get(userId);
}

module.exports = { findUserById };
