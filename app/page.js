'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Plus, RefreshCw } from 'lucide-react';
import TradeForm from './components/TradeForm';
import TradesList from './components/TradesList';
import HoldingsList from './components/HoldingsList';
import PortfolioSummary from './components/PortfolioSummary';
import PortfolioCharts from './components/PortfolioCharts';
import Image from "next/image";
import WatchlistDisplay from './components/WatchlistDisplay';
import QuickStockAdd from './components/QuickStockAdd';


export default function Home() {
  const [trades, setTrades] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialFormData, setInitialFormData] = useState({});
  const [defaultFormType, setDefaultFormType] = useState('BUY');
  const [refreshKey, setRefreshKey] = useState(0);

  async function fetchData() {
    setLoading(true);
    try {
      const [tRes, hRes, sRes] = await Promise.all([
        fetch('/api/trades'),
        fetch('/api/holdings'),
        fetch('/api/portfolio/summary')
      ]);

      const tJson = await tRes.json();
      const hJson = await hRes.json();
      const sJson = await sRes.json();

      // trades → could be { trades: [...] } or just [...]
      const tData = Array.isArray(tJson) ? tJson : tJson.trades;
      // holdings → could be { holdings: [...] } or just [...]
      const hData = Array.isArray(hJson) ? hJson : hJson.holdings;
      // summary → just take as object
      const summaryData = sJson || {};

      setTrades(Array.isArray(tData) ? tData : []);
      setHoldings(Array.isArray(hData) ? hData : []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setTrades([]);
      setHoldings([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Opens TradeForm pre-filled for either 'BUY' or 'SELL' and stock info
  function openForm(type, { stock_symbol, stock_name }) {
    setDefaultFormType(type);
    setInitialFormData({ stockSymbol: stock_symbol, stockName: stock_name });
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
          {/* Header */}
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="mr-2 object-contain"
        />
          <h1 className="text-2xl font-bold text-gray-900">K's Shares</h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            className="text-gray-600 hover:text-gray-800"
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              setInitialFormData({});
              setDefaultFormType('BUY');
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Trade
          </button>
        </div>
      </div>
    </header>


      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'trades', label: 'All Trades' },
              { id: 'holdings', label: 'Holdings' },
              { id: 'charts', label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
          <QuickStockAdd onAdded={() => setRefreshKey(k => k + 1)} />
            <PortfolioSummary summary={summary} />
            <WatchlistDisplay refreshKey={refreshKey} />
            <div className="grid lg:grid-cols-2 gap-4">
              <TradesList
                trades={(trades || []).slice(0, 10)}
                onDeleted={fetchData}
                onQuickAction={openForm}
              />
              <HoldingsList holdings={holdings || []} />
            </div>
          </>
        )}

        {activeTab === 'trades' && (
          <TradesList
            trades={trades || []}
            onDeleted={fetchData}
            onQuickAction={openForm}
          />
        )}

        {activeTab === 'holdings' && <HoldingsList holdings={holdings || []} />}

        {activeTab === 'charts' && (
          <PortfolioCharts holdings={holdings || []} trades={trades || []} />
        )}
      </main>

      {/* Trade Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <TradeForm
            initialData={initialFormData}
            defaultType={defaultFormType}
            onTradeAdded={() => {
              fetchData();
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}