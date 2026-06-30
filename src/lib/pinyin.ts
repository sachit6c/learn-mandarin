// Map tone diacritics to tone number
const TONE_MAP: Record<string, number> = {
  'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4,
  'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
  'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
  'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
  'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
  'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
};

function getTone(syllable: string): number {
  for (const ch of syllable) {
    if (ch in TONE_MAP) return TONE_MAP[ch];
  }
  return 0;
}

export interface PinyinSyllable {
  text: string;
  tone: number;
}

export function parsePinyin(pinyin: string): PinyinSyllable[] {
  // Split on whitespace into word-level tokens (punctuation stays attached to its word).
  const parts = pinyin.trim().split(/\s+/).filter(Boolean);
  return parts.map((part) => ({
    text: part,
    tone: getTone(part),
  }));
}
