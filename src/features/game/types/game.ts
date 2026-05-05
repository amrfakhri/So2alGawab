export type TeamId = 'A' | 'B';
export type LifelineId = 'callFriend' | 'discardQuestion' | 'answerReward';
export type GamePhase =
  | 'setup'
  | 'question'
  | 'waiting_answer'
  | 'answer_revealed'
  | 'result'
  | 'finished';
export type FeedbackStatus = 'correct' | 'wrong' | 'timeout' | 'skipped';
export type SubcategoryType = 'image' | 'text' | 'mixed';

export interface Subcategory {
  id: string;
  name: string;
  image: string;
  description: string;
  type: SubcategoryType;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Question {
  id: string;
  categoryId: string;
  subcategoryId: string;
  prompt: string;
  image?: string;
  options: string[];
  correctIndex: number;
  points: number;
  hint: string;
}

export interface TeamLifelines {
  callFriend: boolean;
  discardQuestion: boolean;
  answerReward: boolean;
}

export interface TeamState {
  id: TeamId;
  name: string;
  score: number;
  lifelines: TeamLifelines;
  answerRewardArmed: boolean;
}

export interface RoundFeedback {
  status: FeedbackStatus;
  earnedPoints: number;
  correctIndex: number;
  selectedAnswerIndex: number | null;
  usedAnswerReward: boolean;
  message: string;
}

export interface GameState {
  phase: GamePhase;
  availableCategories: Category[];
  selectedSubcategoryIds: string[];
  teams: Record<TeamId, TeamState>;
  questionDeck: Question[];
  currentQuestionIndex: number;
  activeTeamId: TeamId;
  remainingMs: number;
  selectedAnswerIndex: number | null;
  roundFeedback: RoundFeedback | null;
  revealedHint: string | null;
  endedEarly: boolean;
}
