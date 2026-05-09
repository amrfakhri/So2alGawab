import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLanguageStore } from '../../../localization/languageStore';

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
  const { t } = useTranslation('game');
  const { isRTL } = useLanguageStore();

  if (phase === 'waiting_answer') {
    return <PrimaryButton label={t('presenter.reveal_answer')} onPress={onReveal} />;
  }

  if (phase === 'answer_revealed') {
    return (
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <PrimaryButton
          label={t('presenter.wrong')}
          onPress={onMarkWrong}
          style={styles.secondaryAction}
        />
        <PrimaryButton label={t('presenter.correct')} onPress={onMarkCorrect} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#1B4965',
  },
});
