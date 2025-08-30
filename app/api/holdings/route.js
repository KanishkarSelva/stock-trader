import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  const { data: holdings, error } = await supabase.from('holdings').select('*');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ holdings }));
}
