import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useCards, deleteCard } from '../hooks/useCards';
import { CardFormModal } from '../components/browse/CardFormModal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { parsePinyin } from '../lib/pinyin';

function PinyinInline({ pinyin }: { pinyin: string }) {
  const syllables = parsePinyin(pinyin);
  return (
    <>
      {syllables.map((s, i) => (
        <span key={i} className={`tone-${s.tone} mr-0.5 text-sm`}>{s.text}</span>
      ))}
    </>
  );
}

export function BrowsePage() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const cards = useCards(undefined, search) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hanzi, pinyin, or English…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      <p className="text-xs text-gray-400 mb-3">{cards.length} cards</p>

      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-4"
          >
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-50 w-12 shrink-0">{card.hanzi}</span>
            <div className="flex-1 min-w-0">
              <div><PinyinInline pinyin={card.pinyin} /></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{card.english}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {card.hskLevel && <Badge variant="blue">HSK {card.hskLevel}</Badge>}
              {card.source === 'custom' && <Badge variant="green">Custom</Badge>}
              {card.source === 'custom' && (
                <button
                  onClick={() => deleteCard(card.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Delete card"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CardFormModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
