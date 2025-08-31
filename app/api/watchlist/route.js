import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  try {
    const { data: watchlist, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(watchlist || []), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { symbol, name, type, region } = await request.json();

    // Check if stock already exists in watchlist
    const { data: existing } = await supabase
      .from('watchlist')
      .select('id')
      .eq('symbol', symbol)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Stock already in watchlist' }), 
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert([{ symbol, name, type, region }])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify(data[0]), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
}
