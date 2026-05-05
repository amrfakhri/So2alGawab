import { create } from 'zustand';

import {
  advanceToNextTurn,
  answerQuestion,
  createInitialGameState,
  endGame,
  revealPresenterAnswer,
  resolvePresenterAnswer,
  setTeamName,
  startMatch,
  tickQuestionTimer,
  toggleSubcategory,
  useLifeline,
} from '../engine/gameEngine';
import { GameState, LifelineId, TeamId } from '../types/game';

interface GameStore extends GameState {
  setTeamName: (teamId: TeamId, name: string) => void;
  toggleSubcategory: (subcategoryId: string) => void;
  startMatch: () => void;
  answerQuestion: (answerIndex: number) => void;
  revealPresenterAnswer: () => void;
  resolvePresenterAnswer: (correct: boolean) => void;
  tickQuestionTimer: (elapsedMs: number) => void;
  useLifeline: (lifelineId: LifelineId) => void;
  advanceToNextTurn: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialGameState(),
  setTeamName: (teamId, name) =>
    set((state) => setTeamName(state, teamId, name)),
  toggleSubcategory: (subcategoryId) =>
    set((state) => toggleSubcategory(state, subcategoryId)),
  startMatch: () => set((state) => startMatch(state)),
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
