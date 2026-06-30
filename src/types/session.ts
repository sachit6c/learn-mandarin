export interface StudySession {
  id?: number;
  deckId: string;
  startedAt: number;
  endedAt?: number;
  cardsStudied: number;
  correctCount: number;
  againCount: number;
}

export interface ReviewLog {
  id?: number;
  cardId: string;
  deckId: string;
  quality: 0 | 2 | 4 | 5;
  timeTakenMs: number;
  intervalBefore: number;
  intervalAfter: number;
  reviewedAt: number;
}
