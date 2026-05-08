export type TeamId = 'A' | 'B';
export type LifelineId = 'callFriend' | 'discardQuestion' | 'answerReward';
export type QuestionAnswerMode = 'mcq' | 'presenter';
export type QuestionMediaType = 'image' | 'video' | 'audio';
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
  categoryId: string;
  name: string;
  image: string;
  description: string;
  type: SubcategoryType;
  remainingQuestionCount: number;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Question {
  id: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  prompt: string;
  mediaType?: QuestionMediaType;
  mediaUrl?: string;
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  points: number;
  hint: string;
  answerMode: QuestionAnswerMode;
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
  isStartingMatch: boolean;
  matchError: string | null;
}
