import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useDeckStats } from '../../hooks/useDeckStats';
import type { Deck } from '../../types/deck';

interface Props {
  deck: Deck;
}

export function DeckCard({ deck }: Props) {
  const navigate = useNavigate();
  const stats = useDeckStats(deck.id);
  const totalDue = stats.dueCount + stats.learningCount;
  const canStudy = totalDue > 0 || stats.newCount > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{deck.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{deck.description}</p>
        </div>
        <BookOpen className="text-indigo-400 shrink-0 mt-0.5" size={20} />
      </div>

      <div className="flex gap-3 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-gray-600 dark:text-gray-400">{totalDue} due</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-gray-600 dark:text-gray-400">{stats.newCount} new</span>
        </span>
      </div>

      <button
        onClick={() => navigate(`/study/${deck.id}`)}
        disabled={!canStudy}
        className="mt-auto w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
      >
        {canStudy ? 'Study Now' : 'All caught up!'}
      </button>
    </div>
  );
}
