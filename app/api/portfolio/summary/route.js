import { supabase } from '../../../../lib/supabaseClient';

export async function GET() {
  try {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('stock_symbol, trade_type, quantity, price');

    if (error) throw error;

    if (!trades || trades.length === 0) {
      return new Response(JSON.stringify({
        totalInvested: 0,
        realizedPL: 0,
        totalHoldings: 0,
        totalShares: 0
      }), { status: 200 });
    }

    // Maps for each stock
    const holdingsMap = new Map();    // symbol -> net quantity
    const investedMap = new Map();    // symbol -> invested amount (for current holdings)
    let realizedPL = 0;

    for (const trade of trades) {
      const symbol = trade.stock_symbol;
      const qty = Number(trade.quantity);
      const price = Number(trade.price);

      const prevQty = holdingsMap.get(symbol) || 0;
      const prevInvested = investedMap.get(symbol) || 0;

      if (trade.trade_type === 'BUY') {
        // Add to holdings and invested
        holdingsMap.set(symbol, prevQty + qty);
        investedMap.set(symbol, prevInvested + qty * price);
      } else if (trade.trade_type === 'SELL') {
        // Calculate average cost for this stock
        const avgCost = prevQty > 0 ? prevInvested / prevQty : 0;
        // Realized P&L for this sell
        realizedPL += (price - avgCost) * qty;
        // Update holdings and invested
        holdingsMap.set(symbol, prevQty - qty);
        investedMap.set(symbol, prevInvested - avgCost * qty);
      }
    }

    // Only count invested in stocks with positive quantity
    let totalInvested = 0;
    let totalShares = 0;
    let totalHoldings = 0;
    for (const [symbol, qty] of holdingsMap.entries()) {
      if (qty > 0) {
        totalHoldings += 1;
        totalShares += qty;
        totalInvested += investedMap.get(symbol) || 0;
      }
    }

    return new Response(JSON.stringify({
      totalInvested,
      realizedPL,
      totalHoldings,
      totalShares
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}