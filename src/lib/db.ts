import Dexie, { type Table } from 'dexie';
import type { Card, SRSState } from '../types/card';
import type { Deck } from '../types/deck';
import type { StudySession, ReviewLog } from '../types/session';

class MandarinSRSDatabase extends Dexie {
  cards!: Table<Card>;
  srsState!: Table<SRSState>;
  decks!: Table<Deck>;
  sessions!: Table<StudySession>;
  reviewLog!: Table<ReviewLog>;

  constructor() {
    super('MandarinSRS');
    this.version(1).stores({
      cards: 'id, deckId, hanzi, source',
      srsState: 'cardId, deckId, nextReview, state, [deckId+nextReview]',
      decks: 'id',
      sessions: '++id, deckId, startedAt',
      reviewLog: '++id, cardId, deckId, reviewedAt',
    });
  }
}

export const db = new MandarinSRSDatabase();
