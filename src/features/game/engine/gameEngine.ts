import { calculateQuestionScore } from './scoring';
import {
  FeedbackStatus,
  GamePhase,
  GameState,
  LifelineId,
  Question,
  RoundFeedback,
  TeamId,
  TeamState,
} from '../types/game';
import { MAX_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';

export const QUESTION_DURATION_MS = 20_000;

function createTeam(id: TeamId, name: string): TeamState {
  return {
    id,
    name,
    score: 0,
    lifelines: {
      callFriend: true,
      discardQuestion: true,
      answerReward: true,
    },
    answerRewardArmed: false,
  };
}

function getQuestionStartPhase(question: Question | null): GamePhase {
  return question?.answerMode === 'presenter' ? 'question' : 'question';
}

export function createInitialGameState(): GameState {
  return {
    phase: 'setup',
    availableCategories: [],
    selectedSubcategoryIds: [],
    teams: {
      A: createTeam('A', 'Team 1'),
      B: createTeam('B', 'Team 2'),
    },
    questionDeck: [],
    currentQuestionIndex: 0,
    activeTeamId: 'A',
    remainingMs: QUESTION_DURATION_MS,
    selectedAnswerIndex: null,
    roundFeedback: null,
    revealedHint: null,
    endedEarly: false,
    isStartingMatch: false,
    matchError: null,
  };
}

export function setAvailableCategories(
  state: GameState,
  availableCategories: GameState['availableCategories'],
): GameState {
  return {
    ...state,
    availableCategories,
  };
}

export function toggleSubcategory(
  state: GameState,
  subcategoryId: string,
): GameState {
  const isSelected = state.selectedSubcategoryIds.includes(subcategoryId);

  if (isSelected) {
    return {
      ...state,
      selectedSubcategoryIds: state.selectedSubcategoryIds.filter(
        (id) => id !== subcategoryId,
      ),
    };
  }

  if (state.selectedSubcategoryIds.length >= MAX_SUBCATEGORIES_PER_MATCH) {
    return state;
  }

  return {
    ...state,
    selectedSubcategoryIds: [...state.selectedSubcategoryIds, subcategoryId],
  };
}

export function setTeamName(
  state: GameState,
  teamId: TeamId,
  name: string,
): GameState {
  return {
    ...state,
    teams: {
      ...state.teams,
      [teamId]: {
        ...state.teams[teamId],
        name,
      },
    },
  };
}

export function startMatch(
  state: GameState,
  questionDeck: Question[],
): GameState {
  const teamAName = state.teams.A.name.trim() || 'Team 1';
  const teamBName = state.teams.B.name.trim() || 'Team 2';

  return {
    ...createInitialGameState(),
    availableCategories: state.availableCategories,
    teams: {
      A: createTeam('A', teamAName),
      B: createTeam('B', teamBName),
    },
    selectedSubcategoryIds: [...state.selectedSubcategoryIds],
    questionDeck,
    phase: getQuestionStartPhase(questionDeck[0] ?? null),
  };
}

export function endGame(state: GameState): GameState {
  if (state.phase === 'setup' || state.phase === 'finished') {
    return state;
  }

  return {
    ...state,
    phase: 'finished',
    endedEarly: true,
    remainingMs: 0,
  };
}

export function getCompletedQuestionCount(state: GameState): number {
  if (state.phase === 'setup') {
    return 0;
  }

  if (state.phase === 'finished' && !state.endedEarly) {
    return state.questionDeck.length;
  }

  if (state.phase === 'result') {
    return Math.min(state.currentQuestionIndex + 1, state.questionDeck.length);
  }

  return Math.min(state.currentQuestionIndex, state.questionDeck.length);
}

export function getCurrentQuestion(state: GameState): Question | null {
  return state.questionDeck[state.currentQuestionIndex] ?? null;
}

function buildFeedback(
  status: FeedbackStatus,
  question: Question,
  selectedAnswerIndex: number | null,
  earnedPoints: number,
  usedAnswerReward: boolean,
): RoundFeedback {
  const messageMap: Record<FeedbackStatus, string> = {
    correct: 'إجابة صحيحة',
    wrong: 'إجابة خاطئة',
    timeout: 'انتهى الوقت',
    skipped: 'تم تخطي السؤال',
  };

  return {
    status,
    earnedPoints,
    correctIndex: question.correctIndex,
    selectedAnswerIndex,
    usedAnswerReward,
    message: messageMap[status],
  };
}

function applyAnswerResolution(
  state: GameState,
  question: Question,
  status: FeedbackStatus,
  selectedAnswerIndex: number | null,
): GameState {
  const activeTeam = state.teams[state.activeTeamId];
  const correct = status === 'correct';
  const { earnedPoints, usedAnswerReward } = calculateQuestionScore(
    question,
    correct,
    activeTeam.answerRewardArmed,
  );

  return {
    ...state,
    phase: 'result',
    selectedAnswerIndex,
    roundFeedback: buildFeedback(
      status,
      question,
      selectedAnswerIndex,
      earnedPoints,
      usedAnswerReward,
    ),
    teams: {
      ...state.teams,
      [state.activeTeamId]: {
        ...activeTeam,
        score: activeTeam.score + earnedPoints,
        answerRewardArmed: false,
      },
    },
  };
}

export function answerQuestion(
  state: GameState,
  answerIndex: number,
): GameState {
  const question = getCurrentQuestion(state);
  if (!question || state.phase !== 'question' || question.answerMode === 'presenter') {
    return state;
  }

  return applyAnswerResolution(
    state,
    question,
    answerIndex === question.correctIndex ? 'correct' : 'wrong',
    answerIndex,
  );
}

export function revealPresenterAnswer(state: GameState): GameState {
  const question = getCurrentQuestion(state);
  if (!question || state.phase !== 'waiting_answer' || question.answerMode !== 'presenter') {
    return state;
  }

  return {
    ...state,
    phase: 'answer_revealed',
  };
}

export function resolvePresenterAnswer(
  state: GameState,
  correct: boolean,
): GameState {
  const question = getCurrentQuestion(state);
  if (!question || state.phase !== 'answer_revealed' || question.answerMode !== 'presenter') {
    return state;
  }

  return applyAnswerResolution(
    state,
    question,
    correct ? 'correct' : 'wrong',
    null,
  );
}

export function tickQuestionTimer(state: GameState, elapsedMs: number): GameState {
  if (state.phase !== 'question') {
    return state;
  }

  const question = getCurrentQuestion(state);
  if (!question) {
    return state;
  }

  const remainingMs = Math.max(0, state.remainingMs - elapsedMs);
  if (remainingMs > 0) {
    return {
      ...state,
      remainingMs,
    };
  }

  if (question.answerMode === 'presenter') {
    return {
      ...state,
      phase: 'waiting_answer',
      remainingMs: 0,
    };
  }

  const activeTeam = state.teams[state.activeTeamId];
  return {
    ...state,
    phase: 'result',
    remainingMs: 0,
    roundFeedback: buildFeedback('timeout', question, null, 0, false),
    teams: {
      ...state.teams,
      [state.activeTeamId]: {
        ...activeTeam,
        answerRewardArmed: false,
      },
    },
  };
}

export function useLifeline(
  state: GameState,
  lifelineId: LifelineId,
): GameState {
  if (state.phase !== 'question') {
    return state;
  }

  const team = state.teams[state.activeTeamId];
  if (!team.lifelines[lifelineId]) {
    return state;
  }

  if (lifelineId === 'callFriend') {
    const question = getCurrentQuestion(state);
    return {
      ...state,
      revealedHint: question?.hint ?? null,
      teams: {
        ...state.teams,
        [state.activeTeamId]: {
          ...team,
          lifelines: {
            ...team.lifelines,
            callFriend: false,
          },
        },
      },
    };
  }

  if (lifelineId === 'answerReward') {
    return {
      ...state,
      teams: {
        ...state.teams,
        [state.activeTeamId]: {
          ...team,
          answerRewardArmed: true,
          lifelines: {
            ...team.lifelines,
            answerReward: false,
          },
        },
      },
    };
  }

  const question = getCurrentQuestion(state);
  if (!question) {
    return state;
  }

  return {
    ...applyAnswerResolution(state, question, 'skipped', null),
    teams: {
      ...state.teams,
      [state.activeTeamId]: {
        ...team,
        answerRewardArmed: false,
        lifelines: {
          ...team.lifelines,
          discardQuestion: false,
        },
      },
    },
  };
}

export function skipTimer(state: GameState): GameState {
  if (state.phase !== 'question') {
    return state;
  }

  const question = getCurrentQuestion(state);
  if (!question) {
    return state;
  }

  if (question.answerMode === 'presenter') {
    return {
      ...state,
      phase: 'waiting_answer',
      remainingMs: 0,
    };
  }

  const activeTeam = state.teams[state.activeTeamId];
  return {
    ...state,
    phase: 'result',
    remainingMs: 0,
    roundFeedback: buildFeedback('timeout', question, null, 0, false),
    teams: {
      ...state.teams,
      [state.activeTeamId]: {
        ...activeTeam,
        answerRewardArmed: false,
      },
    },
  };
}

export function advanceToNextTurn(state: GameState): GameState {
  const nextIndex = state.currentQuestionIndex + 1;
  if (nextIndex >= state.questionDeck.length) {
    return {
      ...state,
      phase: 'finished',
    };
  }

  const nextQuestion = state.questionDeck[nextIndex] ?? null;
  return {
    ...state,
    phase: getQuestionStartPhase(nextQuestion),
    currentQuestionIndex: nextIndex,
    activeTeamId: state.activeTeamId === 'A' ? 'B' : 'A',
    remainingMs: QUESTION_DURATION_MS,
    selectedAnswerIndex: null,
    roundFeedback: null,
    revealedHint: null,
  };
}
