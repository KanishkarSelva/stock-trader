'use client';

import { useState } from 'react';

export default function StockPicker() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search for stocks using Alpha Vantage Symbol Search
  const searchStocks = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stock-search?query=${searchQuery}`);
      const data = await response.json();
      
      if (data.bestMatches) {
        setSearchResults(data.bestMatches.slice(0, 10)); // Show top 10 results
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add stock to watchlist
  const addToWatchlist = async (stock) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock['1. symbol'],
          name: stock['2. name'],
          type: stock['3. type'],
          region: stock['4. region'],
        }),
      });

      if (response.ok) {
        alert('Stock added to watchlist!');
        setQuery('');
        setSearchResults([]);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Error adding stock to watchlist');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchStocks(value);
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Search</h1>
        <p className="text-gray-600 mb-8">Search and add stocks to your watchlist</p>
        
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for stocks (e.g., AAPL, Microsoft, Tesla, Amazon)"
              className="w-full p-4 pr-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            
            {loading && (
              <div className="absolute right-4 top-4">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="p-4 bg-gray-100 border-b rounded-t-lg">
              <h3 className="font-semibold text-gray-800">Search Results ({searchResults.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {searchResults.map((stock, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-white transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-lg text-blue-600">
                          {stock['1. symbol']}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {stock['3. type']}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {stock['4. region']}
                        </span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {stock['2. name']}
                      </div>
                    </div>
                    <button
                      onClick={() => addToWatchlist(stock)}
                      className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Add to Watchlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query.length >= 2 && searchResults.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No stocks found for "{query}". Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
}
