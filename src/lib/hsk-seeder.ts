import { db } from './db';
import type { Card, SRSState } from '../types/card';
import type { Deck } from '../types/deck';
import hskData from '../data/hsk.json';

const DECK_DEFINITIONS: Omit<Deck, 'createdAt'>[] = [
  { id: 'hsk-1', name: 'HSK 1', description: 'Basic vocabulary — 150 words', isBuiltin: true, hskLevel: 1, isActive: true, newCardsPerDay: 20, maxReviewsPerDay: 150 },
  { id: 'hsk-2', name: 'HSK 2', description: 'Elementary vocabulary — 150 words', isBuiltin: true, hskLevel: 2, isActive: true, newCardsPerDay: 20, maxReviewsPerDay: 150 },
  { id: 'hsk-3', name: 'HSK 3', description: 'Intermediate vocabulary — 300 words', isBuiltin: true, hskLevel: 3, isActive: false, newCardsPerDay: 20, maxReviewsPerDay: 150 },
  { id: 'hsk-4', name: 'HSK 4', description: 'Upper-intermediate — 600 words', isBuiltin: true, hskLevel: 4, isActive: false, newCardsPerDay: 20, maxReviewsPerDay: 150 },
  { id: 'hsk-5', name: 'HSK 5', description: 'Advanced — 1300 words', isBuiltin: true, hskLevel: 5, isActive: false, newCardsPerDay: 20, maxReviewsPerDay: 150 },
  { id: 'hsk-6', name: 'HSK 6', description: 'Mastery — 2500 words', isBuiltin: true, hskLevel: 6, isActive: false, newCardsPerDay: 20, maxReviewsPerDay: 150 },
  { id: 'custom', name: 'My Cards', description: 'Cards you create yourself', isBuiltin: false, isActive: true, newCardsPerDay: 20, maxReviewsPerDay: 150 },
];

let seedPromise: Promise<void> | null = null;

export function seedDatabase(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = _seed().catch((e) => { seedPromise = null; throw e; });
  return seedPromise;
}

async function _seed(): Promise<void> {
  const deckCount = await db.decks.count();
  if (deckCount > 0) return; // Already seeded

  const now = Date.now();

  // Create decks
  const decks: Deck[] = DECK_DEFINITIONS.map((d) => ({ ...d, createdAt: now }));
  await db.decks.bulkAdd(decks);

  // Create cards and SRS states from hsk.json
  const rawCards = (hskData as { cards: Array<Record<string, unknown>> }).cards;
  const cards: Card[] = rawCards.map((c) => ({
    id: c.id as string,
    hanzi: c.hanzi as string,
    pinyin: c.pinyin as string,
    english: c.english as string,
    deckId: `hsk-${c.hskLevel}` as string,
    source: 'hsk' as const,
    hskLevel: c.hskLevel as 1 | 2 | 3 | 4 | 5 | 6,
    partOfSpeech: (c.partOfSpeech as string) ?? '',
    exampleZh: (c.exampleZh as string) ?? '',
    examplePinyin: (c.examplePinyin as string) ?? '',
    exampleEn: (c.exampleEn as string) ?? '',
    tags: [],
    createdAt: now,
  }));

  const srsStates: SRSState[] = cards.map((card) => ({
    cardId: card.id,
    deckId: card.deckId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: now,
    lastReview: 0,
    lapses: 0,
    state: 'new' as const,
    learningStep: 0,
  }));

  await db.cards.bulkAdd(cards);
  await db.srsState.bulkAdd(srsStates);
}
