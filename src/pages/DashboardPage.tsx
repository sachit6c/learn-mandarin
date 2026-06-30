import { StreakWidget } from '../components/dashboard/StreakWidget';
import { DeckCard } from '../components/dashboard/DeckCard';
import { useDecks } from '../hooks/useDecks';

export function DashboardPage() {
  const decks = useDecks();
  const activeDecks = decks.filter((d) => d.isActive);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Today's Study</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <StreakWidget />
      </div>

      {activeDecks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No active decks</p>
          <p className="text-sm">Enable decks in the Decks tab to start studying.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
