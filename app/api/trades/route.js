import Database from '../../../lib/database';

export async function GET() {
  const db = new Database();
  try {
    const trades = await db.getAllTrades();
    return Response.json({ trades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return Response.json({ error: 'Failed to fetch trades' }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(request) {
  const db = new Database();
  try {
    const { stockSymbol, stockName, tradeType, quantity, price, tradeDate } = await request.json();
    if (!stockSymbol || !stockName || !tradeType || !quantity || !price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['BUY','SELL'].includes(tradeType)) {
      return Response.json({ error: 'Invalid trade type' }, { status: 400 });
    }
    if (quantity <= 0 || price <= 0) {
      return Response.json({ error: 'Quantity and price must be positive' }, { status: 400 });
    }
    if (tradeType === 'SELL') {
      const holding = await db.get('SELECT total_quantity FROM holdings WHERE stock_symbol = ?', [stockSymbol]);
      if (!holding || holding.total_quantity < quantity) {
        return Response.json({ error: `Insufficient holdings. You have ${holding?.total_quantity||0} shares` }, { status: 400 });
      }
    }
    const trade = await db.addTrade(
      stockSymbol.toUpperCase(),
      stockName,
      tradeType,
      parseInt(quantity),
      parseFloat(price),
      tradeDate || new Date().toISOString()
    );
    return Response.json({ message: 'Trade added', trade: { id: trade.id } });
  } catch (error) {
    console.error('Error adding trade:', error);
    return Response.json({ error: 'Failed to add trade' }, { status: 500 });
  } finally {
    await db.close();
  }
}
