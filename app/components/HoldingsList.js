export default function HoldingsList({ holdings }) {
    const fmtDate = d => new Date(d).toLocaleDateString();
    const fmtCurr = v => v.toLocaleString('en-US',{style:'currency',currency:'USD'});
    if (!holdings.length) {
      return <div className="p-4 bg-white rounded shadow text-center">No holdings.</div>;
    }
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
            {holdings.map(h => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="font-medium">{h.stock_symbol}</div>
                  <div className="text-sm text-gray-500">{h.stock_name}</div>
                </td>
                <td className="px-4 py-2">{h.total_quantity}</td>
                <td className="px-4 py-2">{fmtCurr(h.average_buy_price)}</td>
                <td className="px-4 py-2">{fmtCurr(h.total_invested)}</td>
                <td className="px-4 py-2">{fmtDate(h.last_updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  