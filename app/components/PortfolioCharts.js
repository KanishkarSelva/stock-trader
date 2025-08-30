import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#8884D8','#82CA9D'];

export default function PortfolioCharts({ holdings, trades }) {
  const holdingsData = holdings.map(h => ({ name:h.stock_symbol, value:h.total_invested, quantity:h.total_quantity }));
  const tradeData = trades.reduce((acc,t) => {
    let item = acc.find(i=>i.name===t.stock_symbol);
    if (!item) {
      item = { name:t.stock_symbol, bought:0, sold:0 };
      acc.push(item);
    }
    if (t.trade_type==='BUY') item.bought += t.price*t.quantity;
    else item.sold += t.price*t.quantity;
    return acc;
  }, []);

  const renderPieTooltip = ({ active, payload }) => {
    if (active && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <div className="font-semibold">{d.name}</div>
          <div>Invested: ${d.value.toLocaleString()}</div>
          <div>Shares: {d.quantity}</div>
        </div>
      );
    }
    return null;
  };

  const renderBarTooltip = ({ active, payload, label }) => {
    if (active && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <div className="font-semibold">{label}</div>
          {payload.map((p,i)=>(
            <div key={i} className="text-sm" style={{ color:p.color }}>
              {p.name}: ${p.value.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!holdingsData.length && !tradeData.length) {
    return <div className="p-4 bg-white rounded shadow text-center">No data for charts.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {holdingsData.length>0 && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="mb-2 font-semibold">Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={holdingsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {holdingsData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip content={renderPieTooltip}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {tradeData.length>0 && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="mb-2 font-semibold">Buy vs Sell Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tradeData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip content={renderBarTooltip}/>
              <Legend/>
              <Bar dataKey="bought" fill="#10b981" name="Bought"/>
              <Bar dataKey="sold" fill="#ef4444" name="Sold"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
