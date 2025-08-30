import { supabase } from '../../../../lib/supabaseClient';

export async function GET() {
  try {
    // Total invested: sum of quantity*price for BUY trades
    const { data: buyData, error: buyError } = await supabase
      .from('trades')
      .select('quantity, price')
      .eq('trade_type', 'BUY');
    if (buyError) throw buyError;
    const totalInvested = buyData.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);

    // Total realized P&L: sum quantity*price for SELL trades
    const { data: sellData, error: sellError } = await supabase
      .from('trades')
      .select('quantity, price')
      .eq('trade_type', 'SELL');
    if (sellError) throw sellError;
    const totalSellValue = sellData.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);

    // NOTE: Realized P&L calculation ideally should subtract cost basis, here simplified:
    const realizedPL = totalSellValue - totalInvested;

    // Holdings count and total shares
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('stock_symbol, total_quantity');
    if (holdingsError) throw holdingsError;
    const totalHoldings = holdings.length;
    const totalStocks = holdings.reduce((sum, h) => sum + h.total_quantity, 0);

    const summary = {
      totalInvested,
      realizedPL,
      totalHoldings,
      totalStocks
    };

    return new Response(JSON.stringify(summary), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
