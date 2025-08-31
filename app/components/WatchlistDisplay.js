'use client';

import { useState, useEffect } from 'react';

export default function WatchlistDisplay({ refreshKey }) {
  const [watchlist, setWatchlist] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/watchlist');
        const data = await res.json();
        setWatchlist(data);
        await fetchStockPrices(data); // fetch prices after setting watchlist
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  const fetchStockPrices = async (stocks) => {
    const prices = {};
    for (const stock of stocks) {
      try {
        const response = await fetch(`/api/stock-quote?symbol=${stock.symbol}`);
        const data = await response.json();
        if (data['Global Quote']) {
          const quote = data['Global Quote'];
          prices[stock.symbol] = {
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          };
        }
      } catch (error) {
        console.error(`Error fetching price for ${stock.symbol}:`, error);
      }
    }
    setStockPrices(prices);
  };

const removeFromWatchlist = async (id) => {
  try {
    await fetch(`/api/stock-search/watchlist/${id}`, { method: 'DELETE' });
    setWatchlist(watchlist.filter(stock => stock.id !== id));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
};

  if (loading) return <div className="p-4">Loading watchlist...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Stock Watchlist</h3>
      {watchlist.length === 0 ? (
        <p className="text-gray-500">No stocks in watchlist yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Company</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Change</th>
                <th className="text-right py-2">Change %</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(stock => {
                const priceData = stockPrices[stock.symbol];
                return (
                  <tr key={stock.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-semibold text-blue-600">
                      {stock.symbol}
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-gray-600">{stock.name}</div>
                    </td>
                    <td className="py-3 text-right">
                      {priceData ? `$${priceData.price.toFixed(2)}` : '-'}
                    </td>
                    <td className={`py-3 text-right ${
                      priceData?.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {priceData ? `${priceData.change >= 0 ? '+' : ''}${priceData.change.toFixed(2)}` : '-'}
                    </td>
                    <td className={`py-3 text-right ${
                      priceData?.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {priceData ? `${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%` : '-'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => removeFromWatchlist(stock.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}