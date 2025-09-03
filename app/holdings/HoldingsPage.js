'use client';

import { useState, useEffect } from 'react';
import HoldingsList from '../components/HoldingsList';

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchHoldings() {
      try {
        const res = await fetch(`/api/holdings?refresh=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
      } catch (err) {
        setError(err.message || 'Failed to load holdings');
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, [refreshKey]);

  if (loading) return <p>Loading holdings...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setRefreshKey(k => k + 1)}
      >
        Refresh Holdings
      </button>
      <HoldingsList holdings={holdings} />
    </>
  );
}