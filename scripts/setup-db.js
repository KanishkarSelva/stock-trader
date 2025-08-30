const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const fs = require('fs');
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'trades.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Trades table - stores all buy and sell transactions
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_symbol VARCHAR(10) NOT NULL,
      stock_name VARCHAR(100) NOT NULL,
      trade_type VARCHAR(4) NOT NULL CHECK(trade_type IN ('BUY', 'SELL')),
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      trade_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Holdings table - tracks current stock positions
  db.run(`
    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_symbol VARCHAR(10) UNIQUE NOT NULL,
      stock_name VARCHAR(100) NOT NULL,
      total_quantity INTEGER NOT NULL DEFAULT 0,
      average_buy_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      total_invested DECIMAL(15,2) NOT NULL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables created successfully!');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database setup completed successfully!');
  }
});