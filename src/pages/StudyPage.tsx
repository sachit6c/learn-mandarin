import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FlashCard } from '../components/study/FlashCard';
import { RatingButtons } from '../components/study/RatingButtons';
import { ProgressBar } from '../components/study/ProgressBar';
import { SessionComplete } from '../components/study/SessionComplete';
import { useStudyQueue } from '../hooks/useStudyQueue';
import { useStudyStore } from '../stores/studyStore';
import { useTTS } from '../hooks/useTTS';
import { useSettingsStore } from '../stores/settingsStore';
import { computeSM2, previewIntervals } from '../lib/srs';
import { db } from '../lib/db';
import type { Quality } from '../types/srs';

export function StudyPage() {
  const { deckId = '' } = useParams();
  const navigate = useNavigate();
  const { buildQueue } = useStudyQueue(deckId);
  const { speak } = useTTS();
  const { autoPlayAudio } = useSettingsStore();
  const { queue, currentIndex, setQueue, requeue, advance, recordResult } = useStudyStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cardStartTime = useRef(Date.now());

  // Build queue on mount. The `cancelled` flag prevents a stale build (e.g. the
  // discarded first run under StrictMode) from overwriting the live queue after cleanup.
  useEffect(() => {
    let cancelled = false;
    buildQueue().then((items) => {
      if (cancelled) return;
      setQueue(items, deckId);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
      useStudyStore.getState().reset();
    };
    // Intentionally only re-run when the deck changes — not when buildQueue's identity
    // changes (it depends on a live-query'd deck) or setQueue is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const currentItem = queue[currentIndex];

  // Auto-play audio when card changes
  useEffect(() => {
    if (currentItem && autoPlayAudio && loaded) {
      speak(currentItem.card.hanzi);
    }
    setIsFlipped(false);
    cardStartTime.current = Date.now();
    // Run only when the displayed card changes, so toggling settings mid-card
    // doesn't replay audio or reset the flip state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentItem]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
    if (currentItem) speak(currentItem.card.hanzi);
  }, [currentItem, speak]);

  const handleRate = useCallback(async (quality: Quality) => {
    if (!currentItem) return;

    const now = Date.now();
    const result = computeSM2(
      {
        easeFactor: currentItem.srs.easeFactor,
        interval: currentItem.srs.interval,
        repetitions: currentItem.srs.repetitions,
        quality,
        learningStep: currentItem.srs.learningStep,
        state: currentItem.srs.state,
      },
      now
    );

    const timeTaken = now - cardStartTime.current;

    await db.srsState.update(currentItem.srs.cardId, {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReview,
      lastReview: now,
      state: result.state,
      learningStep: result.learningStep,
      lapses: quality < 2 && currentItem.srs.state === 'review'
        ? currentItem.srs.lapses + 1
        : currentItem.srs.lapses,
      // Mark the moment a card leaves 'new' so the per-day new-card cap can be enforced.
      introducedAt: currentItem.srs.state === 'new'
        ? now
        : currentItem.srs.introducedAt,
    });

    await db.reviewLog.add({
      cardId: currentItem.card.id,
      deckId,
      quality,
      timeTakenMs: timeTaken,
      intervalBefore: currentItem.srs.interval,
      intervalAfter: result.interval,
      reviewedAt: now,
    });

    recordResult(quality >= 2);

    // If Again, re-add to end of queue (learning loop)
    const isAgain = quality < 2;
    if (isAgain) {
      requeue({ ...currentItem, srs: { ...currentItem.srs, ...result } });
    }

    // An "Again" always requeues, so the session can only finish on a pass.
    const effectiveLength = queue.length + (isAgain ? 1 : 0);
    if (currentIndex + 1 >= effectiveLength) {
      // Save session. recordResult already counted this card, so read straight
      // from the store without re-adding the current result.
      const { startedAt, correctCount, againCount } = useStudyStore.getState();
      await db.sessions.add({
        deckId,
        startedAt,
        endedAt: now,
        cardsStudied: correctCount + againCount,
        correctCount,
        againCount,
      });
      setDone(true);
    } else {
      // Reset the flip in the same update as the advance so the next card never
      // renders in its flipped (answer-showing) state.
      setIsFlipped(false);
      advance();
    }
  }, [currentItem, currentIndex, queue, deckId, requeue, advance, recordResult]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) handleFlip();
      }
      if (isFlipped) {
        if (e.key === '1') handleRate(0);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(4);
        if (e.key === '4') handleRate(5);
      }
      if (e.key === 'a' || e.key === 'A') {
        if (currentItem) speak(currentItem.card.hanzi);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFlipped, handleFlip, handleRate, currentItem, speak]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading cards...</div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-6xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">All caught up!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">No cards due for this deck right now.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">← Back to home</button>
      </div>
    );
  }

  if (done) {
    const { correctCount, againCount } = useStudyStore.getState();
    return (
      <SessionComplete
        correctCount={correctCount}
        againCount={againCount}
        onStudyMore={() => {
          buildQueue().then((items) => {
            setQueue(items, deckId);
            setDone(false);
          });
        }}
      />
    );
  }

  const intervals = currentItem
    ? previewIntervals(
        {
          easeFactor: currentItem.srs.easeFactor,
          interval: currentItem.srs.interval,
          repetitions: currentItem.srs.repetitions,
          quality: 4,
          learningStep: currentItem.srs.learningStep,
          state: currentItem.srs.state,
        },
        Date.now()
      )
    : ({ 0: '—', 2: '—', 4: '—', 5: '—' } as Record<Quality, string>);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {currentItem?.card.deckId.toUpperCase().replace('-', ' ')}
        </span>
      </div>

      <ProgressBar current={currentIndex} total={queue.length} />

      <div className="mt-8 relative">
        {currentItem && (
          <FlashCard
            key={currentIndex}
            card={currentItem.card}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onAudio={() => currentItem && speak(currentItem.card.hanzi)}
          />
        )}
      </div>

      {!isFlipped && (
        <div className="mt-8 text-center">
          <button
            onClick={handleFlip}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Show Answer <span className="opacity-60 text-sm ml-1">[Space]</span>
          </button>
        </div>
      )}

      {isFlipped && currentItem && (
        <RatingButtons onRate={handleRate} intervals={intervals} />
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        Space = flip · 1/2/3/4 = rate · A = audio
      </p>
    </div>
  );
}
