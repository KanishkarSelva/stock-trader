import { supabase } from '../../../../lib/supabaseClient';

export async function GET() {
  try {
    // Fetch all trades grouped by stock and trade_type
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

    // Compute totals
    let totalInvested = 0;
    let totalSellValue = 0;

    // Track net shares per stock symbol
    const holdingsMap = new Map();

    for (const trade of trades) {
      const qtyPrice = trade.quantity * trade.price;
      const symbol = trade.stock_symbol;

      if (trade.trade_type === 'BUY') {
        totalInvested += qtyPrice;
        holdingsMap.set(symbol, (holdingsMap.get(symbol) || 0) + trade.quantity);
      } else if (trade.trade_type === 'SELL') {
        totalSellValue += qtyPrice;
        holdingsMap.set(symbol, (holdingsMap.get(symbol) || 0) - trade.quantity);
      }
    }

    // Calculate realized P&L as totalSellValue - totalInvested (simplified)
    const realizedPL = totalSellValue - totalInvested;

    // Filter holdings with positive shares
    const filteredHoldings = [...holdingsMap.values()].filter(qty => qty > 0);

    const totalHoldings = filteredHoldings.length;
    const totalShares = filteredHoldings.reduce((sum, qty) => sum + qty, 0);

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
