import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { addCustomCard } from '../../hooks/useCards';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CardFormModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState({
    hanzi: '',
    pinyin: '',
    english: '',
    partOfSpeech: '',
    exampleZh: '',
    examplePinyin: '',
    exampleEn: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hanzi.trim() || !form.pinyin.trim() || !form.english.trim()) return;
    setSaving(true);
    await addCustomCard({
      hanzi: form.hanzi.trim(),
      pinyin: form.pinyin.trim(),
      english: form.english.trim(),
      partOfSpeech: form.partOfSpeech.trim(),
      exampleZh: form.exampleZh.trim(),
      examplePinyin: form.examplePinyin.trim(),
      exampleEn: form.exampleEn.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      deckId: 'custom',
      hskLevel: undefined,
    });
    setSaving(false);
    setForm({ hanzi: '', pinyin: '', english: '', partOfSpeech: '', exampleZh: '', examplePinyin: '', exampleEn: '', tags: '' });
    onClose();
  };

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {field('Hanzi *', 'hanzi', '爱')}
        {field('Pinyin *', 'pinyin', 'ài')}
        {field('English *', 'english', 'love; to love')}
        {field('Part of Speech', 'partOfSpeech', 'v/n')}
        {field('Example (Chinese)', 'exampleZh', '我爱你。')}
        {field('Example (Pinyin)', 'examplePinyin', 'Wǒ ài nǐ.')}
        {field('Example (English)', 'exampleEn', 'I love you.')}
        {field('Tags (comma separated)', 'tags', 'emotion, verb')}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Add Card'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
