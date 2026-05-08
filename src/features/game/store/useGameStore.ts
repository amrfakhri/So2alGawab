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
  startMatch,
  tickQuestionTimer,
  toggleSubcategory,
  useLifeline,
} from '../engine/gameEngine';
import { buildQuestionDeckForMatch } from '../../../services/supabase/gameService';
import { Category, GameState, LifelineId, TeamId } from '../types/game';

interface GameStore extends GameState {
  setAvailableCategories: (categories: Category[]) => void;
  setTeamName: (teamId: TeamId, name: string) => void;
  toggleSubcategory: (subcategoryId: string) => void;
  startMatch: () => Promise<boolean>;
  answerQuestion: (answerIndex: number) => void;
  revealPresenterAnswer: () => void;
  resolvePresenterAnswer: (correct: boolean) => void;
  tickQuestionTimer: (elapsedMs: number) => void;
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
  useLifeline: (lifelineId) =>
    set((state) => useLifeline(state, lifelineId)),
  advanceToNextTurn: () =>
    set((state) => advanceToNextTurn(state)),
  endGame: () => set((state) => endGame(state)),
  resetGame: () => set(createInitialGameState()),
}));
