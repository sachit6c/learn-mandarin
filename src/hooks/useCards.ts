import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { Card } from '../types/card';

export function useCards(deckId?: string, search?: string) {
  return useLiveQuery(async () => {
    let cards = deckId
      ? await db.cards.where('deckId').equals(deckId).toArray()
      : await db.cards.toArray();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      cards = cards.filter(
        (c) =>
          c.hanzi.includes(q) ||
          c.pinyin.toLowerCase().includes(q) ||
          c.english.toLowerCase().includes(q)
      );
    }

    return cards;
  }, [deckId, search]);
}

export async function addCustomCard(card: Omit<Card, 'id' | 'createdAt' | 'source'>) {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  const newCard: Card = { ...card, id, source: 'custom', createdAt: now, deckId: 'custom' };

  await db.cards.add(newCard);
  await db.srsState.add({
    cardId: id,
    deckId: 'custom',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: now,
    lastReview: 0,
    lapses: 0,
    state: 'new',
    learningStep: 0,
  });

  return newCard;
}

export async function deleteCard(cardId: string) {
  await db.cards.delete(cardId);
  await db.srsState.delete(cardId);
}
