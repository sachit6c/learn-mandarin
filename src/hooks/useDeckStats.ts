import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { startOfDay } from '../lib/date-utils';

export interface DeckStats {
  dueCount: number;
  newCount: number;
  learningCount: number;
}

export function useDeckStats(deckId: string): DeckStats {
  const stats = useLiveQuery(async () => {
    const now = Date.now();
    const todayStart = startOfDay(now);

    const [dueReview, totalNew, learningCards, introducedToday, deck] = await Promise.all([
      db.srsState
        .where('[deckId+nextReview]')
        .between([deckId, 0], [deckId, now], true, true)
        .and((s) => s.state === 'review')
        .count(),
      db.srsState
        .where('deckId')
        .equals(deckId)
        .and((s) => s.state === 'new')
        .count(),
      db.srsState
        .where('[deckId+nextReview]')
        .between([deckId, 0], [deckId, now], true, true)
        .and((s) => s.state === 'learning' || s.state === 'relearning')
        .count(),
      db.srsState
        .where('deckId')
        .equals(deckId)
        .and((s) => (s.introducedAt ?? 0) >= todayStart)
        .count(),
      db.decks.get(deckId),
    ]);

    // Show how many new cards can actually be studied today, not the deck's full backlog.
    const newCardsPerDay = deck?.newCardsPerDay ?? 20;
    const newCount = Math.max(0, Math.min(totalNew, newCardsPerDay - introducedToday));

    return { dueCount: dueReview, newCount, learningCount: learningCards };
  }, [deckId]);

  return stats ?? { dueCount: 0, newCount: 0, learningCount: 0 };
}

export function useStreakDays(): number {
  const streak = useLiveQuery(async () => {
    const sessions = await db.sessions.orderBy('startedAt').reverse().limit(365).toArray();
    if (sessions.length === 0) return 0;

    const DAY = 24 * 60 * 60 * 1000;
    const today = startOfDay(Date.now());
    const newestDay = startOfDay(sessions[0].startedAt);

    // The streak is only broken once the user misses a *full* day: keep yesterday's
    // streak alive throughout today until midnight.
    if (newestDay < today - DAY) return 0;

    let streak = 0;
    let checkDate = newestDay; // today or yesterday

    for (const session of sessions) {
      const sessionDay = startOfDay(session.startedAt);
      if (sessionDay === checkDate) {
        streak++;
        checkDate -= DAY;
      } else if (sessionDay < checkDate) {
        break;
      }
    }
    return streak;
  }, []);

  return streak ?? 0;
}
