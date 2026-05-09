import { create } from 'zustand';

import {
  advanceToNextTurn,
  answerQuestion,
  createInitialGameState,
  endGame,
  revealPresenterAnswer,
  resolvePresenterAnswer,
  setAvailableCategories,
  setTeamName,
  skipTimer,
  startMatch,
  tickQuestionTimer,
  toggleSubcategory,
  useLifeline,
} from '../engine/gameEngine';
import { buildQuestionDeckForMatch } from '../../../services/supabase/gameService';
import { updateGameSession } from '../../../services/supabase/sessionService';
import { Category, GameState, LifelineId, TeamId } from '../types/game';

interface GameStore extends GameState {
  tvSessionId: string | null;
  setTvSessionId: (id: string | null) => void;
  setAvailableCategories: (categories: Category[]) => void;
  setTeamName: (teamId: TeamId, name: string) => void;
  toggleSubcategory: (subcategoryId: string) => void;
  startMatch: () => Promise<boolean>;
  answerQuestion: (answerIndex: number) => void;
  revealPresenterAnswer: () => void;
  resolvePresenterAnswer: (correct: boolean) => void;
  tickQuestionTimer: (elapsedMs: number) => void;
  skipTimer: () => void;
  useLifeline: (lifelineId: LifelineId) => void;
  advanceToNextTurn: () => void;
  endGame: () => void;
  resetGame: () => void;
}

function toFriendlyError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'تعذر تحميل بيانات اللعبة حالياً. حاول مرة أخرى.';
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),
  tvSessionId: null,
  setTvSessionId: (id) => set({ tvSessionId: id }),
  setAvailableCategories: (categories) =>
    set((state) => setAvailableCategories(state, categories)),
  setTeamName: (teamId, name) =>
    set((state) => setTeamName(state, teamId, name)),
  toggleSubcategory: (subcategoryId) =>
    set((state) => toggleSubcategory(state, subcategoryId)),
  startMatch: async () => {
    const state = get();

    set({
      isStartingMatch: true,
      matchError: null,
    });

    try {
      const questionDeck = await buildQuestionDeckForMatch(
        state.selectedSubcategoryIds,
        state.availableCategories,
      );

      set((currentState) => ({
        ...startMatch(currentState, questionDeck),
        isStartingMatch: false,
        matchError: null,
      }));

      return true;
    } catch (error) {
      set({
        isStartingMatch: false,
        matchError: toFriendlyError(error),
      });

      return false;
    }
  },
  answerQuestion: (answerIndex) =>
    set((state) => answerQuestion(state, answerIndex)),
  revealPresenterAnswer: () =>
    set((state) => revealPresenterAnswer(state)),
  resolvePresenterAnswer: (correct) =>
    set((state) => resolvePresenterAnswer(state, correct)),
  tickQuestionTimer: (elapsedMs) =>
    set((state) => tickQuestionTimer(state, elapsedMs)),
  skipTimer: () =>
    set((state) => skipTimer(state)),
  useLifeline: (lifelineId) =>
    set((state) => useLifeline(state, lifelineId)),
  advanceToNextTurn: () =>
    set((state) => advanceToNextTurn(state)),
  endGame: () => set((state) => endGame(state)),
  resetGame: () => set({ ...createInitialGameState(), tvSessionId: null }),
}));

// ── Realtime TV sync ──────────────────────────────────────────────────────────
// Fires whenever phase, question index, or scores change. Ignores timer ticks
// (they only change remainingMs, which is not in the sync key).
let _lastSyncKey = '';
useGameStore.subscribe((state) => {
  const { tvSessionId, phase, currentQuestionIndex, teams, questionDeck } = state;
  if (!tvSessionId || phase === 'setup' || phase === 'finished') return;

  const syncKey = `${tvSessionId}|${phase}|${currentQuestionIndex}|${teams.A.score}|${teams.B.score}`;
  if (syncKey === _lastSyncKey) return;
  _lastSyncKey = syncKey;

  const question = questionDeck[currentQuestionIndex] ?? null;
  updateGameSession(tvSessionId, {
    current_question: question?.prompt ?? null,
    current_category: question?.categoryName ?? null,
    current_phase: phase,
    team1_score: teams.A.score,
    team2_score: teams.B.score,
  }).catch(() => {});
});
