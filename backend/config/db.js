const Database = require('better-sqlite3');
const db = new Database('pos.db');

module.exports = { db };