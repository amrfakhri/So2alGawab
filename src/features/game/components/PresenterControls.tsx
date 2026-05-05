import React from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { GamePhase } from '../types/game';

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
  if (phase === 'waiting_answer') {
    return <PrimaryButton label="عرض الإجابة" onPress={onReveal} />;
  }

  if (phase === 'answer_revealed') {
    return (
      <View style={styles.row}>
        <PrimaryButton
          label="إجابة خاطئة"
          onPress={onMarkWrong}
          style={styles.secondaryAction}
        />
        <PrimaryButton label="إجابة صحيحة" onPress={onMarkCorrect} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#1B4965',
  },
});
