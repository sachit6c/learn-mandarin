import { useTTS } from '../hooks/useTTS';
import { useSettingsStore } from '../stores/settingsStore';
import { db } from '../lib/db';
import { Button } from '../components/ui/Button';
import { Moon, Sun, Volume2 } from 'lucide-react';

export function SettingsPage() {
  const { voices, speak, selectVoice, selectedVoice } = useTTS();
  const { speechRate, setSpeechRate, autoPlayAudio, setAutoPlayAudio, darkMode, setDarkMode } = useSettingsStore();

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const exportData = async () => {
    const [cards, srsState, decks, sessions, reviewLog] = await Promise.all([
      db.cards.toArray(),
      db.srsState.toArray(),
      db.decks.toArray(),
      db.sessions.toArray(),
      db.reviewLog.toArray(),
    ]);
    const blob = new Blob([JSON.stringify({ cards, srsState, decks, sessions, reviewLog }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandarin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(await file.text());
      } catch {
        alert('Import failed: the selected file is not valid JSON.');
        return;
      }

      // Validate the shape before touching the database.
      const tables = ['cards', 'srsState', 'decks', 'sessions', 'reviewLog'] as const;
      const isValid =
        data && typeof data === 'object' &&
        tables.some((t) => Array.isArray(data[t])) &&
        tables.every((t) => data[t] === undefined || Array.isArray(data[t]));
      if (!isValid) {
        alert('Import failed: this does not look like a MandarinSRS backup file.');
        return;
      }

      if (!confirm('This will overwrite your existing progress. Continue?')) return;

      try {
        await db.transaction('rw', [db.cards, db.srsState, db.decks, db.sessions, db.reviewLog], async () => {
          await db.cards.clear(); await db.cards.bulkAdd((data.cards as never[]) ?? []);
          await db.srsState.clear(); await db.srsState.bulkAdd((data.srsState as never[]) ?? []);
          await db.decks.clear(); await db.decks.bulkAdd((data.decks as never[]) ?? []);
          await db.sessions.clear(); await db.sessions.bulkAdd((data.sessions as never[]) ?? []);
          await db.reviewLog.clear(); await db.reviewLog.bulkAdd((data.reviewLog as never[]) ?? []);
        });
        alert('Data imported successfully!');
      } catch (err) {
        alert(`Import failed: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    };
    input.click();
  };

  const section = (title: string) => (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-6 first:mt-0">{title}</h2>
  );

  const row = (label: string, desc: string, control: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {control}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-5">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-1 mb-4">
        {section('Appearance')}
        {row('Dark mode', '', (
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-gray-500" size={20} />}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-1 mb-4">
        {section('Audio')}
        {row('Auto-play audio', 'Play pronunciation when card is shown', (
          <button
            type="button"
            role="switch"
            aria-checked={autoPlayAudio}
            aria-label="Toggle auto-play audio"
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${autoPlayAudio ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPlayAudio ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        ))}
        {row('Speech rate', `${Math.round(speechRate * 100)}% speed`, (
          <div className="flex items-center gap-2">
            <input
              type="range" min={0.5} max={1.5} step={0.05}
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="w-28"
            />
            <button onClick={() => speak('你好')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <Volume2 size={16} />
            </button>
          </div>
        ))}
        {voices.length > 0 && row('Voice', 'Mandarin TTS voice', (
          <select
            value={selectedVoice?.name ?? ''}
            onChange={(e) => selectVoice(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 max-w-48"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        ))}
        {voices.length === 0 && (
          <p className="text-xs text-orange-500 py-2">No Mandarin voices found. Install a Chinese TTS voice in your OS settings.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4">
        {section('Data')}
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={exportData}>Export backup</Button>
          <Button variant="secondary" size="sm" onClick={importData}>Import backup</Button>
        </div>
      </div>
    </div>
  );
}
