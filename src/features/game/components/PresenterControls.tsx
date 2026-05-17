import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GamePhase } from '../types/game';
import { GameButton } from './GameButton';

interface PresenterControlsProps {
  phase: GamePhase;
  onReveal: () => void;
  onMarkCorrect: () => void;
  onMarkWrong: () => void;
}

export function PresenterControls({
  phase,
  onReveal,
  onMarkCorrect,
  onMarkWrong,
}: PresenterControlsProps) {
  const { t } = useTranslation('game');

  if (phase === 'waiting_answer') {
    return <GameButton label={t('presenter.reveal_answer')} onPress={onReveal} />;
  }

  if (phase === 'answer_revealed') {
    return (
      <View style={styles.row}>
        <GameButton
          label={t('presenter.wrong')}
          variant="secondary"
          onPress={onMarkWrong}
          style={styles.half}
        />
        <GameButton
          label={t('presenter.correct')}
          variant="success"
          onPress={onMarkCorrect}
          style={styles.half}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  half: { flex: 1 },
});
