export type Quality = 0 | 2 | 4 | 5;

export interface SM2Input {
  easeFactor: number;
  interval: number;
  repetitions: number;
  quality: Quality;
  learningStep: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  learningStep: number;
}
