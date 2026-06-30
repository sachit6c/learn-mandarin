export interface Card {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  deckId: string;
  source: 'hsk' | 'custom';
  hskLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  partOfSpeech?: string;
  exampleZh?: string;
  examplePinyin?: string;
  exampleEn?: string;
  tags: string[];
  createdAt: number;
}

export interface SRSState {
  cardId: string;
  deckId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  lastReview: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  learningStep: number;
  /** Timestamp the card first left the 'new' state, used to enforce the per-day new-card cap. */
  introducedAt?: number;
}
