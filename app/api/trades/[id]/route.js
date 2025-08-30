import { supabase } from '../../../../lib/supabaseClient';

export async function DELETE(request, { params }) {
  const { id } = params;

  // Delete trade by id
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // Optionally: recalculate holdings here or in a separate job

  return new Response(JSON.stringify({ message: 'Trade deleted' }));
}
