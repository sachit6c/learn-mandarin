import { Flame } from 'lucide-react';
import { useStreakDays } from '../../hooks/useDeckStats';

export function StreakWidget() {
  const streak = useStreakDays();

  return (
    <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl px-4 py-3">
      <Flame className="text-orange-500" size={22} />
      <div>
        <p className="text-lg font-bold text-orange-600 dark:text-orange-400 leading-none">{streak}</p>
        <p className="text-xs text-orange-500 dark:text-orange-400">day streak</p>
      </div>
    </div>
  );
}
