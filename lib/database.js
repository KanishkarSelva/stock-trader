const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'trades.db');
    this.db = new sqlite3.Database(dbPath);
  }

  // Helper method to promisify database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Trade operations
  async addTrade(stockSymbol, stockName, tradeType, quantity, price, tradeDate) {
    const trade = await this.run(
      `INSERT INTO trades (stock_symbol, stock_name, trade_type, quantity, price, trade_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [stockSymbol, stockName, tradeType, quantity, price, tradeDate]
    );

    // Update holdings
    if (tradeType === 'BUY') {
      await this.updateHoldingsAfterBuy(stockSymbol, stockName, quantity, price);
    } else {
      await this.updateHoldingsAfterSell(stockSymbol, quantity, price);
    }

    return trade;
  }

  async updateHoldingsAfterBuy(stockSymbol, stockName, quantity, price) {
    const existingHolding = await this.get(
      'SELECT * FROM holdings WHERE stock_symbol = ?',
      [stockSymbol]
    );

    if (existingHolding) {
      // Update existing holding
      const newTotalQuantity = existingHolding.total_quantity + quantity;
      const newTotalInvested = existingHolding.total_invested + (quantity * price);
      const newAveragePrice = newTotalInvested / newTotalQuantity;

      await this.run(
        `UPDATE holdings 
         SET total_quantity = ?, average_buy_price = ?, total_invested = ?, last_updated = CURRENT_TIMESTAMP
         WHERE stock_symbol = ?`,
        [newTotalQuantity, newAveragePrice, newTotalInvested, stockSymbol]
      );
    } else {
      // Create new holding
      await this.run(
        `INSERT INTO holdings (stock_symbol, stock_name, total_quantity, average_buy_price, total_invested)
         VALUES (?, ?, ?, ?, ?)`,
        [stockSymbol, stockName, quantity, price, quantity * price]
      );
    }
  }

  async updateHoldingsAfterSell(stockSymbol, quantity, price) {
    const existingHolding = await this.get(
      'SELECT * FROM holdings WHERE stock_symbol = ?',
      [stockSymbol]
    );

    if (existingHolding && existingHolding.total_quantity >= quantity) {
      const newTotalQuantity = existingHolding.total_quantity - quantity;
      
      if (newTotalQuantity === 0) {
        // Remove holding if all stocks sold
        await this.run('DELETE FROM holdings WHERE stock_symbol = ?', [stockSymbol]);
      } else {
        // Update quantity and total invested proportionally
        const sellRatio = quantity / existingHolding.total_quantity;
        const newTotalInvested = existingHolding.total_invested * (1 - sellRatio);
        
        await this.run(
          `UPDATE holdings 
           SET total_quantity = ?, total_invested = ?, last_updated = CURRENT_TIMESTAMP
           WHERE stock_symbol = ?`,
          [newTotalQuantity, newTotalInvested, stockSymbol]
        );
      }
    }
  }

  async getAllTrades() {
    return await this.all(
      'SELECT * FROM trades ORDER BY trade_date DESC, id DESC'
    );
  }

  async getAllHoldings() {
    return await this.all(
      'SELECT * FROM holdings WHERE total_quantity > 0 ORDER BY stock_symbol'
    );
  }

  async getPortfolioSummary() {
    const holdings = await this.getAllHoldings();
    const trades = await this.all(
      `SELECT 
         trade_type,
         SUM(quantity * price) as total_value,
         SUM(CASE WHEN trade_type = 'SELL' THEN quantity * price ELSE 0 END) as total_sold,
         SUM(CASE WHEN trade_type = 'BUY' THEN quantity * price ELSE 0 END) as total_bought
       FROM trades`
    );

    const totalInvested = holdings.reduce((sum, holding) => sum + holding.total_invested, 0);
    const totalSold = trades[0]?.total_sold || 0;
    const totalBought = trades[0]?.total_bought || 0;
    const realizedPL = totalSold - (totalBought - totalInvested);

    return {
      totalInvested,
      realizedPL,
      totalHoldings: holdings.length,
      totalStocks: holdings.reduce((sum, holding) => sum + holding.total_quantity, 0)
    };
  }

  close() {
    return new Promise((resolve) => {
      this.db.close(() => {
        resolve();
      });
    });
  }
}

module.exports = Database;