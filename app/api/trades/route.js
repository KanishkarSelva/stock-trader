import { supabase } from '../../../lib/supabaseClient';

console.log('Supabase client:', supabase);
export async function GET() {
  const { data: trades, error } = await supabase
    .from('trades')
    .select('*')
    .order('trade_date', { ascending: false });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ trades }));
}

export async function POST(request) {
  const { stockSymbol, stockName, tradeType, quantity, price, tradeDate } = await request.json();

  const { data, error } = await supabase
    .from('trades')
    .insert([
      {
        stock_symbol: stockSymbol.toUpperCase(),
        stock_name: stockName,
        trade_type: tradeType,
        quantity,
        price,
        trade_date: tradeDate || new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  if (!data || data.length === 0) {
    return new Response(JSON.stringify({ error: 'Failed to insert trade' }), { status: 500 });
  }

  const trade = data[0];

  return new Response(JSON.stringify({ message: 'Trade added', trade }), { status: 200 });
}


