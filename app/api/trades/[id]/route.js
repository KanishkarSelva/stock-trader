import Database from '../../../../lib/database';

export async function DELETE(request, { params }) {
  const { id } = params;
  const db = new Database();

  try {
    const trade = await db.get('SELECT * FROM trades WHERE id = ?', [id]);
    if (!trade) {
      return Response.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Delete trade
    await db.run('DELETE FROM trades WHERE id = ?', [id]);

    // Rebuild holdings from remaining trades
    await db.run('DELETE FROM holdings');
    const remainingTrades = await db.all('SELECT * FROM trades ORDER BY trade_date');
    for (const t of remainingTrades) {
      if (t.trade_type === 'BUY') {
        await db.updateHoldingsAfterBuy(t.stock_symbol, t.stock_name, t.quantity, t.price);
      } else {
        await db.updateHoldingsAfterSell(t.stock_symbol, t.quantity, t.price);
      }
    }

    return Response.json({ message: 'Trade deleted' });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return Response.json({ error: 'Failed to delete trade' }, { status: 500 });
  } finally {
    await db.close();
  }
}
