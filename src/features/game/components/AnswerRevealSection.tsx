import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../shared/theme/colors';
import { useLanguageStore } from '../../../localization/languageStore';

interface AnswerRevealSectionProps {
  answer: string;
}

export function AnswerRevealSection({ answer }: AnswerRevealSectionProps) {
  const { t } = useTranslation('game');
  const { isRTL } = useLanguageStore();
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.card}>
      <Text style={[styles.eyebrow, { textAlign }]}>{t('correct_answer_eyebrow')}</Text>
      <Text style={[styles.answer, { textAlign }]}>{answer}</Text>
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
  },
  answer: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 28,
  },
});
