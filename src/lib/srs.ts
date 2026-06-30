import { addDays, addMinutes } from './date-utils';
import type { SM2Input, SM2Result, Quality } from '../types/srs';

// Learning steps in minutes before a card graduates to review
const LEARNING_STEPS = [1, 10];
const GRADUATING_INTERVAL = 1; // days after completing learning steps

export function computeSM2(input: SM2Input, now: number): SM2Result {
  const { quality, easeFactor, interval, repetitions, learningStep, state } = input;

  // Cards in learning/relearning phase use step-based scheduling
  if (state === 'new' || state === 'learning' || state === 'relearning') {
    if (quality < 2) {
      // Failed: restart learning from step 0
      return {
        easeFactor,
        interval: 0,
        repetitions: 0,
        nextReview: addMinutes(now, LEARNING_STEPS[0]),
        state: state === 'new' ? 'learning' : 'relearning',
        learningStep: 0,
      };
    }

    const nextStep = learningStep + 1;
    if (nextStep < LEARNING_STEPS.length) {
      // Advance to next learning step
      return {
        easeFactor,
        interval: 0,
        repetitions,
        nextReview: addMinutes(now, LEARNING_STEPS[nextStep]),
        state: 'learning',
        learningStep: nextStep,
      };
    }

    // Graduate to review
    const gradInterval = quality === 5 ? GRADUATING_INTERVAL * 4 : GRADUATING_INTERVAL;
    return {
      easeFactor,
      interval: gradInterval,
      repetitions: 1,
      nextReview: addDays(now, gradInterval),
      state: 'review',
      learningStep: 0,
    };
  }

  // Review phase: SM-2 algorithm
  if (quality < 2) {
    // Lapse: send back to relearning. interval stays 0 while in learning steps
    // so the UI previews the step (minutes), not a day-based interval.
    return {
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      interval: 0,
      repetitions: 0,
      nextReview: addMinutes(now, LEARNING_STEPS[0]),
      state: 'relearning',
      learningStep: 0,
    };
  }

  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEF = Math.max(1.3, easeFactor + efDelta);

  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.ceil(interval * newEF);
  }

  if (quality === 5) {
    newInterval = Math.ceil(newInterval * 1.3);
  }

  return {
    easeFactor: newEF,
    interval: newInterval,
    repetitions: repetitions + 1,
    nextReview: addDays(now, newInterval),
    state: 'review',
    learningStep: 0,
  };
}

export function previewIntervals(input: SM2Input, now: number): Record<Quality, string> {
  const qualities: Quality[] = [0, 2, 4, 5];
  const result: Partial<Record<Quality, string>> = {};

  for (const q of qualities) {
    const out = computeSM2({ ...input, quality: q }, now);
    if (out.interval === 0) {
      // Still in learning steps
      const stepIdx = out.learningStep;
      const mins = LEARNING_STEPS[Math.min(stepIdx, LEARNING_STEPS.length - 1)];
      result[q] = mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
    } else {
      const d = out.interval;
      if (d < 7) result[q] = `${d}d`;
      else if (d < 30) result[q] = `${Math.round(d / 7)}w`;
      else if (d < 365) result[q] = `${Math.round(d / 30)}mo`;
      else result[q] = `${(d / 365).toFixed(1)}y`;
    }
  }

  return result as Record<Quality, string>;
}
