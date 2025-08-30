import { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

export default function TradeForm({
   onTradeAdded,
    onClose,
    initialData = {},
    defaultType
  }) {
    const [formData, setFormData] = useState({
      stockSymbol: initialData.stockSymbol || '',
      stockName:   initialData.stockName   || '',
   tradeType: 'BUY',
     tradeType: defaultType || 'BUY',
      quantity: '',
      price:    '',
      tradeDate: new Date().toISOString().split('T')[0]
    });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/trades', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Add trade failed');
      setFormData({ stockSymbol:'',stockName:'',tradeType:'BUY',quantity:'',price:'',tradeDate:new Date().toISOString().split('T')[0] });
      onTradeAdded();
      onClose?.();
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add Trade</h2>
        {onClose && <button onClick={onClose}><X /></button>}
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Stock Symbol*</label>
          <input name="stockSymbol" value={formData.stockSymbol} onChange={handleChange}
            required className="w-full border rounded px-2 py-1"/>
        </div>
        <div>
          <label>Stock Name*</label>
          <input name="stockName" value={formData.stockName} onChange={handleChange}
            required className="w-full border rounded px-2 py-1"/>
        </div>
        <div>
          <label>Type*</label>
          <select name="tradeType" value={formData.tradeType} onChange={handleChange}
            required className="w-full border rounded px-2 py-1">
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>
        <div>
          <label>Quantity*</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange}
            required min="1" className="w-full border rounded px-2 py-1"/>
        </div>
        <div>
          <label>Price per Share*</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange}
            required min="0.01" step="0.01" className="w-full border rounded px-2 py-1"/>
        </div>
        <div>
          <label>Date*</label>
          <input type="date" name="tradeDate" value={formData.tradeDate} onChange={handleChange}
            required className="w-full border rounded px-2 py-1"/>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded flex justify-center">
          {loading ? 'Adding...' : <>
            <PlusCircle className="mr-2"/> Add Trade
          </>}
        </button>
      </form>
    </div>
  );
}
