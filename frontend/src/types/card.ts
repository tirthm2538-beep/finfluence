export type TrackType = 'core-finance' | 'stock-market';

export interface QuizOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  takeaway: string;
}

export interface StoryCardData {
  id: string;
  conceptNumber: number;
  track: TrackType;
  trackTitle: string;
  conceptTitle: string;
  tag: string;
  readTime: string;
  hook: string;
  explanation: string;
  analogy: string;
  analogyIcon?: string;
  quiz: Quiz;
}
