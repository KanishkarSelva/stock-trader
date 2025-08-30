import Database from '../../../../lib/database';

export async function GET() {
  const db = new Database();
  try {
    const summary = await db.getPortfolioSummary();
    return Response.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return Response.json({ error: 'Failed to fetch summary' }, { status: 500 });
  } finally {
    await db.close();
  }
}
