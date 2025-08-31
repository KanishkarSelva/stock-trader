export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return new Response(JSON.stringify({ error: 'Query required' }), { status: 400 });
  }

  try {
    const API_KEY = '21DG5WAJ0ID6QFQA' || 'demo';
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    );
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to search stocks' }), 
      { status: 500 }
    );
  }
}
