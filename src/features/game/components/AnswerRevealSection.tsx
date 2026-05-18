import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { alpha, dark, palette, r, textStyle } from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';

interface AnswerRevealSectionProps {
  answer: string;
}

export function AnswerRevealSection({ answer }: AnswerRevealSectionProps) {
  const { t, textAlign } = useLocale('game');

  return (
    <View style={styles.card}>
      <Text style={[styles.eyebrow, { textAlign }]}>{t('correct_answer_eyebrow')}</Text>
      <Text style={[styles.answer,  { textAlign }]}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: alpha.success[16],
    borderRadius: r.card,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.success[600],
    gap: 8,
  },
  eyebrow: {
    color: dark.textSuccess,
    ...textStyle.captionMd,
    fontWeight: '800',
  },
  answer: {
    color: dark.textPrimary,
    ...textStyle.titleSectionMd,
    fontWeight: '800',
    lineHeight: 28,
  },
});
