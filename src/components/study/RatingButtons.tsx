import type { Quality } from '../../types/srs';

interface RatingButton {
  quality: Quality;
  label: string;
  shortcut: string;
  colorClass: string;
  hoverClass: string;
}

const BUTTONS: RatingButton[] = [
  { quality: 0, label: 'Again', shortcut: '1', colorClass: 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400', hoverClass: 'hover:bg-red-50 dark:hover:bg-red-900/30' },
  { quality: 2, label: 'Hard', shortcut: '2', colorClass: 'border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400', hoverClass: 'hover:bg-orange-50 dark:hover:bg-orange-900/30' },
  { quality: 4, label: 'Good', shortcut: '3', colorClass: 'border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400', hoverClass: 'hover:bg-blue-50 dark:hover:bg-blue-900/30' },
  { quality: 5, label: 'Easy', shortcut: '4', colorClass: 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400', hoverClass: 'hover:bg-green-50 dark:hover:bg-green-900/30' },
];

interface Props {
  onRate: (quality: Quality) => void;
  intervals: Record<Quality, string>;
}

export function RatingButtons({ onRate, intervals }: Props) {
  return (
    <div className="flex gap-3 justify-center mt-6">
      {BUTTONS.map((btn) => (
        <button
          key={btn.quality}
          onClick={() => onRate(btn.quality)}
          className={`flex flex-col items-center px-5 py-3 rounded-xl border-2 transition-colors font-medium ${btn.colorClass} ${btn.hoverClass}`}
        >
          <span className="text-base">{btn.label}</span>
          <span className="text-xs opacity-70 mt-0.5">{intervals[btn.quality]}</span>
          <span className="text-xs opacity-40 mt-0.5">[{btn.shortcut}]</span>
        </button>
      ))}
    </div>
  );
}
