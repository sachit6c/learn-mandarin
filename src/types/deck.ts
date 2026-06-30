export interface Deck {
  id: string;
  name: string;
  description: string;
  isBuiltin: boolean;
  hskLevel?: number;
  isActive: boolean;
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  createdAt: number;
}
