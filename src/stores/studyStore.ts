import { create } from 'zustand';
import type { Card, SRSState } from '../types/card';

export interface StudyItem {
  card: Card;
  srs: SRSState;
}

interface StudyStoreState {
  queue: StudyItem[];
  currentIndex: number;
  sessionDeckId: string;
  correctCount: number;
  againCount: number;
  startedAt: number;
  setQueue: (queue: StudyItem[], deckId: string) => void;
  requeue: (item: StudyItem) => void;
  advance: () => void;
  recordResult: (correct: boolean) => void;
  reset: () => void;
}

export const useStudyStore = create<StudyStoreState>((set) => ({
  queue: [],
  currentIndex: 0,
  sessionDeckId: '',
  correctCount: 0,
  againCount: 0,
  startedAt: 0,

  setQueue: (queue, deckId) =>
    set({ queue, currentIndex: 0, sessionDeckId: deckId, correctCount: 0, againCount: 0, startedAt: Date.now() }),

  requeue: (item) => set((s) => ({ queue: [...s.queue, item] })),

  advance: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),

  recordResult: (correct) =>
    set((s) => ({
      correctCount: correct ? s.correctCount + 1 : s.correctCount,
      againCount: correct ? s.againCount : s.againCount + 1,
    })),

  reset: () => set({ queue: [], currentIndex: 0, sessionDeckId: '', correctCount: 0, againCount: 0, startedAt: 0 }),
}));
