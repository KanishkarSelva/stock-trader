import HoldingsPage from './HoldingsPage';

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* Show holdings list here */}
      <HoldingsPage />
    </main>
  );
}
