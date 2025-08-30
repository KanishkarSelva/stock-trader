import Database from '../../../lib/database';

export async function GET() {
  const db = new Database();
  try {
    const holdings = await db.getAllHoldings();
    return Response.json({ holdings });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return Response.json({ error: 'Failed to fetch holdings' }, { status: 500 });
  } finally {
    await db.close();
  }
}
