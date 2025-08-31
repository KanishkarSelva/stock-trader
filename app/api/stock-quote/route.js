export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Symbol required' }), { status: 400 });
  }

  try {
    const API_KEY = '21DG5WAJ0ID6QFQA' || 'demo';
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stock quote' }), 
      { status: 500 }
    );
  }
}
