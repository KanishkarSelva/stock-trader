import { ArrowUpIcon, ArrowDownIcon, Trash2 } from 'lucide-react';

export default function TradesList({ trades, onDeleted, onQuickAction }) {
  function fmtDate(d) {
    return new Date(d).toLocaleDateString();
  }
  function fmtCurr(v) {
    return v.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this trade?')) return;
    const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' });
    if (res.ok) {
      onDeleted();
    } else {
      const { error } = await res.json();
      alert('Error deleting trade: ' + error);
    }
  }

  if (!trades.length) {
    return <div className="p-4 bg-white rounded shadow text-center">No trades yet.</div>;
  }

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Value</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2 text-center">Quick Actions</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <div className="font-medium">{t.stock_symbol}</div>
                <div className="text-sm text-gray-500">{t.stock_name}</div>
              </td>
              <td className="px-4 py-2">
                <span className={`${t.trade_type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.trade_type === 'BUY'
                    ? <ArrowUpIcon className="inline w-4 h-4" />
                    : <ArrowDownIcon className="inline w-4 h-4" />
                  }
                  {t.trade_type}
                </span>
              </td>
              <td className="px-4 py-2">{t.quantity}</td>
              <td className="px-4 py-2">{fmtCurr(t.price)}</td>
              <td className="px-4 py-2">{fmtCurr(t.quantity * t.price)}</td>
              <td className="px-4 py-2">{fmtDate(t.trade_date)}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => onQuickAction('BUY', t)}
                  className="text-green-600 hover:text-green-800 px-2 py-1 border border-green-600 rounded"
                  title="Quick Buy"
                >
                  Buy
                </button>
                <button
                  onClick={() => onQuickAction('SELL', t)}
                  className="text-red-600 hover:text-red-800 px-2 py-1 border border-red-600 rounded"
                  title="Quick Sell"
                >
                  Sell
                </button>
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete trade"
                >
                  <Trash2 className="w-5 h-5 mx-auto" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
