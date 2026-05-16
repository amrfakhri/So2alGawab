import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { dark, r, textStyle } from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';

interface AnswerOptionProps {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  revealState?: 'correct' | 'wrong' | 'neutral';
  onPress: () => void;
}

export function AnswerOption({
  label,
  isSelected,
  isDisabled,
  revealState = 'neutral',
  onPress,
}: AnswerOptionProps) {
  const { textAlign } = useLocale('game');

  const backgroundColor =
    revealState === 'correct' ? dark.answerCorrect
    : revealState === 'wrong' ? dark.answerWrong
    : isSelected              ? dark.answerSelected
    : dark.answerIdle;

  const borderColor =
    revealState === 'correct' ? dark.answerCorrectBorder
    : revealState === 'wrong' ? dark.answerWrongBorder
    : isSelected               ? dark.answerSelectedBorder
    : dark.borderSubtle;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor },
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { textAlign }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: r.card,
    borderWidth: 1.5,
  },
  pressed: { opacity: 0.8 },
  label: {
    color: dark.textPrimary,
    ...textStyle.bodyPrimary,
    fontWeight: '600',
    lineHeight: 22,
  },
});
