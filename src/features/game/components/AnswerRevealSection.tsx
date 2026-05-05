import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';

interface AnswerRevealSectionProps {
  answer: string;
}

export function AnswerRevealSection({ answer }: AnswerRevealSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>الإجابة الصحيحة</Text>
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
  },
  answer: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 28,
  },
});
