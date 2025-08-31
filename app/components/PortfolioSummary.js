import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

export default function PortfolioSummary({ summary = {} }) {
  console.log('PortfolioSummary summary:', summary);
  // Safely format numbers, defaulting to 0 if undefined
  const fmt = (v = 0) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'INR' });

  const profit = (summary.realizedPL ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Invested */}
      <div className="bg-white rounded shadow p-4 flex items-center">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <div className="ml-3">
          <div className="text-sm text-gray-500">Total Invested</div>
          <div className="font-semibold">{fmt(summary.totalInvested)}</div>
        </div>
      </div>

      {/* Realized P&L */}
      <div className="bg-white rounded shadow p-4 flex items-center">
        {profit ? (
          <TrendingUp className="w-6 h-6 text-green-600" />
        ) : (
          <TrendingDown className="w-6 h-6 text-red-600" />
        )}
        <div className="ml-3">
          <div className="text-sm text-gray-500">Realized P&L</div>
          <div className={`font-semibold ${profit ? 'text-green-600' : 'text-red-600'}`}>
            {fmt(summary.realizedPL)}
          </div>
        </div>
      </div>

      {/* Holdings Count */}
      <div className="bg-white rounded shadow p-4 flex items-center">
        <PieChart className="w-6 h-6 text-purple-600" />
        <div className="ml-3">
          <div className="text-sm text-gray-500">Holdings</div>
          <div className="font-semibold">{summary.totalHoldings ?? 0}</div>
        </div>
      </div>

      {/* Total Shares */}
      <div className="bg-white rounded shadow p-4 flex items-center">
        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 font-semibold">#</span>
        </div>
        <div className="ml-3">
          <div className="text-sm text-gray-500">Total Shares</div>
          <div className="font-semibold">{summary.totalShares ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
