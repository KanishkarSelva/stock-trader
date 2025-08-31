'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QuickStockAdd({ onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const quickSearch = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stock-search?query=${searchQuery}`);
      const data = await response.json();
      
      if (data.bestMatches) {
        setResults(data.bestMatches.slice(0, 5)); // Show top 5 for quick add
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickAdd = async (stock) => {
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
        alert(`${stock['1. symbol']} added to watchlist!`);
        setQuery('');
        setResults([]);
        setShowResults(false);
        if (onAdded) onAdded(); // notify parent
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    clearTimeout(window.quickSearchTimeout);
    window.quickSearchTimeout = setTimeout(() => {
      quickSearch(value);
    }, 300);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Add Stock</h3>
        <Link 
          href="/stock-picker"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Advanced Search →
        </Link>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search stock (e.g., AAPL, TSLA, MSFT)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onFocus={() => setShowResults(results.length > 0)}
        />
        
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Quick Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map((stock, index) => (
              <div
                key={index}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => quickAdd(stock)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-blue-600">{stock['1. symbol']}</span>
                    <p className="text-sm text-gray-600 truncate">{stock['2. name']}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    Add
                  </button>
                </div>
              </div>
            ))}
            
            <div className="p-3 bg-gray-50 border-t">
              <Link 
                href="/stock-picker"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                See all results and advanced search →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}