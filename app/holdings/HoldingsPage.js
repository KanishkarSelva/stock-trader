'use client';  // Mark as client component since it uses hooks

import { useState, useEffect } from 'react';
import HoldingsList from '../components/HoldingsList'; // Adjust path if needed

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHoldings() {
      try {
        const res = await fetch('/api/holdings');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        setHoldings(data);  // Pass fetched data to state
      } catch (err) {
        setError(err.message || 'Failed to load holdings');
      } finally {
        setLoading(false);
      }
    }
    fetchHoldings();
  }, []);

  if (loading) return <p>Loading holdings...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // Pass holdings data as a prop to HoldingsList
  return <HoldingsList holdings={holdings} />;
}
