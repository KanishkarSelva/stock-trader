export default function HoldingsList({ holdings }) {
  console.log('Holdings received:', holdings);

  if (!Array.isArray(holdings)) {
    return <div className="p-4 bg-white rounded shadow text-center">No holdings! (Invalid data format)</div>;
  }

  if (holdings.length === 0) {
    return <div className="p-4 bg-white rounded shadow text-center">No holdings!</div>;
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString() : '-';
  const fmtCurr = v => (typeof v === 'number')
    ? v.toLocaleString('en-US', { style: 'currency', currency: 'INR' })
    : '-';

  // Helper to compute avg price and invested if not present
  const computeHolding = h => {
    if (typeof h.average_buy_price === 'number' && typeof h.total_invested === 'number') {
      return h;
    }
    if (!Array.isArray(h.transactions)) return h;

    let totalQty = 0;
    let totalInvested = 0;
    h.transactions.forEach(tx => {
      if (tx.type === 'buy') {
        totalQty += tx.quantity;
        totalInvested += tx.quantity * tx.price;
      }
    });
    return {
      ...h,
      average_buy_price: totalQty ? totalInvested / totalQty : 0,
      total_invested: totalInvested,
    };
  };

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Avg Price</th>
            <th className="px-4 py-2">Invested</th>
            <th className="px-4 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map(h0 => {
            const h = computeHolding(h0);
            return (
              <tr key={h.stock_symbol} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="font-medium">{h.stock_symbol || '-'}</div>
                  <div className="text-sm text-gray-500">{h.stock_name || '-'}</div>
                </td>
                <td className="px-4 py-2">{h.total_quantity || 0}</td>
                <td className="px-4 py-2">{fmtCurr(h.average_buy_price ?? 0)}</td>
                <td className="px-4 py-2">{fmtCurr(h.total_invested ?? 0)}</td>
                <td className="px-4 py-2">{fmtDate(h.last_updated)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}