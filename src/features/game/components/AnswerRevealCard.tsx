import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { alpha, dark, radius, spacing, textStyle } from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';

interface AnswerRevealCardProps {
  correctAnswerText: string;
}

export function AnswerRevealCard({ correctAnswerText }: AnswerRevealCardProps) {
  const { t, textAlign } = useLocale('game');

  return (
    <View style={styles.card}>
      <Text style={[styles.label, { textAlign }]}>{t('correct_answer_eyebrow')}</Text>
      <Text style={[styles.answer, { textAlign }]}>{correctAnswerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.bgSuccessSubtle,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: alpha.white[8],
    padding: spacing.sm,
    gap: spacing['3xs'],
    width: '100%',
  },
  label: {
    color: dark.textSecondary,
    ...textStyle.overline,
    fontWeight: '700',
  },
  answer: {
    color: dark.textSuccess,
    ...textStyle.displayQuestionSm,
    fontWeight: '700',
  },
});
