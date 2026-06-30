import { useDecks, updateDeck } from '../hooks/useDecks';
import { useDeckStats } from '../hooks/useDeckStats';
import { db } from '../lib/db';

function DeckRow({ deckId }: { deckId: string }) {
  const decks = useDecks();
  const deck = decks.find((d) => d.id === deckId);
  const stats = useDeckStats(deckId);

  if (!deck) return null;

  const handleReset = async () => {
    if (!confirm(`Reset all progress for "${deck.name}"? This cannot be undone.`)) return;
    const states = await db.srsState.where('deckId').equals(deckId).toArray();
    const now = Date.now();
    await db.srsState.bulkPut(
      states.map((s) => ({ ...s, state: 'new' as const, easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: now, lastReview: 0, lapses: 0, learningStep: 0 }))
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{deck.name}</h3>
          <p className="text-xs text-gray-400">{deck.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{deck.isActive ? 'Active' : 'Inactive'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={deck.isActive}
            aria-label={`${deck.isActive ? 'Deactivate' : 'Activate'} ${deck.name}`}
            onClick={() => updateDeck(deckId, { isActive: !deck.isActive })}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${deck.isActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${deck.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
        <div className="text-center">
          <p className="font-bold text-red-500">{stats.dueCount}</p>
          <p className="text-xs text-gray-400">due</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-blue-500">{stats.newCount}</p>
          <p className="text-xs text-gray-400">new</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-orange-400">{stats.learningCount}</p>
          <p className="text-xs text-gray-400">learning</p>
        </div>
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">New/day</label>
          <input
            type="number"
            min={1}
            max={100}
            value={deck.newCardsPerDay}
            onChange={(e) => updateDeck(deckId, { newCardsPerDay: Number(e.target.value) })}
            className="w-full mt-1 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Max reviews/day</label>
          <input
            type="number"
            min={10}
            max={1000}
            value={deck.maxReviewsPerDay}
            onChange={(e) => updateDeck(deckId, { maxReviewsPerDay: Number(e.target.value) })}
            className="w-full mt-1 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {deck.isBuiltin && (
        <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-600 transition-colors">
          Reset progress
        </button>
      )}
    </div>
  );
}

export function DecksPage() {
  const decks = useDecks();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-5">Decks</h1>
      <div className="space-y-3">
        {decks.map((deck) => (
          <DeckRow key={deck.id} deckId={deck.id} />
        ))}
      </div>
    </div>
  );
}
