import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  try {
    const { data: trades, error } = await supabase
      .from('trades')
      .select('stock_symbol, stock_name, trade_type, quantity, price, trade_date');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!trades || trades.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const holdingsMap = new Map();

    trades.forEach(({ stock_symbol, stock_name, trade_type, quantity, price, trade_date }) => {
      if (!stock_symbol || !trade_type || quantity == null || price == null) return;

      const current = holdingsMap.get(stock_symbol) || {
        stock_symbol,
        stock_name,
        total_quantity: 0,
        total_invested: 0,
        last_updated: null,
        total_bought_qty: 0,
        total_bought_amount: 0,
      };

      let qty = Number(quantity);
      let amt = qty * Number(price);

      if (trade_type.toUpperCase() === 'BUY') {
        current.total_quantity += qty;
        current.total_invested += amt;
        current.total_bought_qty += qty;
        current.total_bought_amount += amt;
      } else if (trade_type.toUpperCase() === 'SELL') {
        current.total_quantity -= qty;
        // Do not subtract from invested for sells (standard practice)
      }

      // Update last_updated if this trade is newer
      if (!current.last_updated || new Date(trade_date) > new Date(current.last_updated)) {
        current.last_updated = trade_date;
      }

      holdingsMap.set(stock_symbol, current);
    });

    // Calculate average buy price
    const holdings = Array.from(holdingsMap.values())
      .filter(h => h.total_quantity > 0)
      .map(h => ({
        ...h,
        average_buy_price: h.total_bought_qty ? h.total_bought_amount / h.total_bought_qty : 0,
      }));

    return new Response(JSON.stringify(holdings), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}