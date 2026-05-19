import { useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { GamePhase, RoundFeedback } from '../types/game';

const correctSfx = require('../../../assets/sounds/correct.mp3');
const wrongSfx   = require('../../../assets/sounds/wrong.mp3');

// Plays correct.mp3 or wrong.mp3 when an answer is evaluated, then stops
// automatically when the next question starts.
export function useAnswerSound(
  phase: GamePhase,
  roundFeedback: RoundFeedback | null,
) {
  const correctPlayer = useAudioPlayer(correctSfx);
  const wrongPlayer   = useAudioPlayer(wrongSfx);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // Play the matching sound whenever a new feedback object appears.
  // roundFeedback becomes a fresh object reference each time an answer is
  // evaluated, then resets to null when the next question loads — so the
  // dependency on the object reference fires exactly once per answer.
  useEffect(() => {
    if (!roundFeedback) return;

    if (roundFeedback.status === 'correct') {
      wrongPlayer.pause();
      correctPlayer.seekTo(0);
      correctPlayer.play();
    } else {
      correctPlayer.pause();
      wrongPlayer.seekTo(0);
      wrongPlayer.play();
    }
  }, [roundFeedback]);

  // Stop any playing sound the moment the next question begins.
  useEffect(() => {
    if (phase !== 'question') return;
    correctPlayer.pause();
    wrongPlayer.pause();
  }, [phase]);
}
