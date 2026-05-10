import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../../shared/theme/colors';
import { useLanguageStore } from '../../../localization/languageStore';

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
  const { isRTL } = useLanguageStore();
  const backgroundColor =
    revealState === 'correct'
      ? '#DFF5E6'
      : revealState === 'wrong'
        ? '#F9E0E0'
        : isSelected
          ? '#FBE8D9'
          : colors.card;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor },
        isSelected && styles.selected,
      ]}
    >
      <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});
