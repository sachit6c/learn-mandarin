import { useState, useCallback } from 'react';
import { db } from '../lib/db';
import { startOfDay } from '../lib/date-utils';
import type { StudyItem } from '../stores/studyStore';
import { useDeck } from './useDecks';

export function useStudyQueue(deckId: string) {
  const deck = useDeck(deckId);
  const [loading, setLoading] = useState(false);

  const buildQueue = useCallback(async (): Promise<StudyItem[]> => {
    setLoading(true);
    const now = Date.now();
    const todayStart = startOfDay(now);
    const newCardsPerDay = deck?.newCardsPerDay ?? 20;
    const maxReviews = deck?.maxReviewsPerDay ?? 150;

    // Daily caps are enforced across sessions: subtract what's already been done today.
    const introducedToday = await db.srsState
      .where('deckId')
      .equals(deckId)
      .and((s) => (s.introducedAt ?? 0) >= todayStart)
      .count();
    const reviewsDoneToday = await db.reviewLog
      .where('deckId')
      .equals(deckId)
      .and((r) => r.reviewedAt >= todayStart && r.intervalBefore > 0)
      .count();
    const remainingNew = Math.max(0, newCardsPerDay - introducedToday);
    const remainingReviews = Math.max(0, maxReviews - reviewsDoneToday);

    // 1. Learning/relearning cards due now (highest priority, never capped)
    const learningStates = await db.srsState
      .where('[deckId+nextReview]')
      .between([deckId, 0], [deckId, now], true, true)
      .and((s) => s.state === 'learning' || s.state === 'relearning')
      .toArray();

    // 2. Review cards due today (up to remaining daily review allowance)
    const reviewStates = await db.srsState
      .where('[deckId+nextReview]')
      .between([deckId, 0], [deckId, now], true, true)
      .and((s) => s.state === 'review')
      .limit(remainingReviews)
      .toArray();

    // 3. New cards (up to remaining daily new-card allowance)
    const newStates = await db.srsState
      .where('deckId')
      .equals(deckId)
      .and((s) => s.state === 'new')
      .limit(remainingNew)
      .toArray();

    const allStates = [...learningStates, ...reviewStates, ...newStates];
    const cardIds = allStates.map((s) => s.cardId);
    const cards = await db.cards.bulkGet(cardIds);

    const items: StudyItem[] = allStates
      .map((srs, i) => {
        const card = cards[i];
        if (!card) return null;
        return { card, srs };
      })
      .filter((item): item is StudyItem => item !== null);

    setLoading(false);
    return items;
  }, [deckId, deck]);

  return { buildQueue, loading };
}
