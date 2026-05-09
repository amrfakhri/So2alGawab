import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../shared/theme/colors';

interface AnswerRevealSectionProps {
  answer: string;
}

export function AnswerRevealSection({ answer }: AnswerRevealSectionProps) {
  const { t } = useTranslation('game');

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{t('correct_answer_eyebrow')}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAF7EE',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#B7DEC3',
    gap: 8,
  },
  eyebrow: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'right',
  },
  answer: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'right',
  },
});
