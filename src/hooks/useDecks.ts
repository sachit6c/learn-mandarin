import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { Deck } from '../types/deck';

export function useDecks() {
  const decks = useLiveQuery(() => db.decks.toArray(), []);
  return decks ?? [];
}

export function useDeck(id: string) {
  return useLiveQuery(() => db.decks.get(id), [id]);
}

export async function updateDeck(id: string, changes: Partial<Deck>) {
  await db.decks.update(id, changes);
}
