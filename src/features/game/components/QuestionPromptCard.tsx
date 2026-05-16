import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { alpha, dark, gradients, palette, r, radius, textStyle } from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';

interface QuestionPromptCardProps {
  eyebrow: string;
  prompt: string;
  hint?: string | null;
  hintLabel?: string;
}

export function QuestionPromptCard({
  eyebrow,
  prompt,
  hint,
  hintLabel,
}: QuestionPromptCardProps) {
  const { textAlign } = useLocale('game');

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={gradients.cardGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.border} />

      <View style={styles.content}>
        <Text style={[styles.eyebrow, { textAlign }]}>{eyebrow}</Text>
        <Text style={[styles.prompt,  { textAlign }]}>{prompt}</Text>

        {hint ? (
          <View style={styles.hintBox}>
            {hintLabel ? (
              <Text style={[styles.hintLabel, { textAlign }]}>{hintLabel}</Text>
            ) : null}
            <Text style={[styles.hintText, { textAlign }]}>{hint}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: alpha.white[8],
  },
  content: {
    padding: 16,
    gap: 4,
  },
  eyebrow: {
    color: dark.textSecondary,
    ...textStyle.labelSm,
  },
  prompt: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '700',
    lineHeight: 27,
  },
  hintBox: {
    marginTop: 8,
    backgroundColor: alpha.gold[8],
    borderRadius: r.card,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: palette.gold[600],
  },
  hintLabel: {
    color: dark.textAccent,
    ...textStyle.labelMd,
    fontWeight: '800',
  },
  hintText: {
    color: dark.textPrimary,
    ...textStyle.bodyPrimary,
    lineHeight: 22,
  },
});
