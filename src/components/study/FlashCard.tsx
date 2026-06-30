import { Volume2 } from 'lucide-react';
import { parsePinyin } from '../../lib/pinyin';
import type { Card } from '../../types/card';

interface Props {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onAudio: () => void;
}

function PinyinDisplay({ pinyin }: { pinyin: string }) {
  const syllables = parsePinyin(pinyin);
  return (
    <p className="text-2xl font-medium mt-2 mb-1 tracking-wide">
      {syllables.map((s, i) => (
        <span key={i} className={`tone-${s.tone} mr-1`}>
          {s.text}
        </span>
      ))}
    </p>
  );
}

export function FlashCard({ card, isFlipped, onFlip, onAudio }: Props) {
  return (
    <div className="card-scene w-full max-w-xl mx-auto" style={{ height: 320 }}>
      <div className={`card-flip w-full h-full ${isFlipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div
          className="card-face w-full h-full rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={onFlip}
        >
          <p className="text-8xl font-bold text-gray-900 dark:text-gray-50 mb-4">{card.hanzi}</p>
          {card.partOfSpeech && (
            <span className="text-xs text-gray-400 uppercase tracking-widest">{card.partOfSpeech}</span>
          )}
          <p className="mt-6 text-sm text-gray-400">tap to reveal</p>
        </div>

        {/* Back */}
        <div className="card-face card-face-back rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-8">
          <p className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-1">{card.hanzi}</p>
          <PinyinDisplay pinyin={card.pinyin} />
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2 text-center">{card.english}</p>

          {card.exampleZh && (
            <div className="mt-5 border-t border-gray-100 dark:border-gray-700 pt-4 text-center w-full">
              <p className="text-base text-gray-800 dark:text-gray-200">{card.exampleZh}</p>
              {card.examplePinyin && (
                <PinyinDisplay pinyin={card.examplePinyin} />
              )}
              {card.exampleEn && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.exampleEn}</p>
              )}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onAudio(); }}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="Play audio (A)"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>

      {/* Audio button on front too */}
      {!isFlipped && (
        <button
          onClick={(e) => { e.stopPropagation(); onAudio(); }}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          style={{ position: 'absolute', top: 16, right: 16 }}
          title="Play audio (A)"
        >
          <Volume2 size={20} />
        </button>
      )}
    </div>
  );
}
