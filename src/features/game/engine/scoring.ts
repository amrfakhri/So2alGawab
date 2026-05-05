import { Question } from '../types/game';

export function calculateQuestionScore(
  question: Question,
  correct: boolean,
  answerRewardArmed: boolean,
) {
  if (!correct) {
    return { earnedPoints: 0, usedAnswerReward: false };
  }

  const multiplier = answerRewardArmed ? 2 : 1;
  return {
    earnedPoints: question.points * multiplier,
    usedAnswerReward: answerRewardArmed,
  };
}
