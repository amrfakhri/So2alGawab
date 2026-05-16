import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLanguageStore } from '../../../localization/languageStore';
import { dark, r, radius, spacing, textStyle } from '../../../shared/theme/tokens';

interface TeamNameFieldsProps {
  teamAName: string;
  teamBName: string;
  onChangeTeamA: (value: string) => void;
  onChangeTeamB: (value: string) => void;
}

export function TeamNameFields({
  teamAName,
  teamBName,
  onChangeTeamA,
  onChangeTeamB,
}: TeamNameFieldsProps) {
  const { t } = useTranslation('setup');
  const { isRTL } = useLanguageStore();
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.card}>
      <Text style={[styles.title, { textAlign }]}>{t('teams.section_title')}</Text>
      <TextInput
        placeholder={t('teams.team_a_placeholder')}
        placeholderTextColor={dark.textTertiary}
        value={teamAName}
        onChangeText={onChangeTeamA}
        style={[styles.input, { textAlign }]}
      />
      <TextInput
        placeholder={t('teams.team_b_placeholder')}
        placeholderTextColor={dark.textTertiary}
        value={teamBName}
        onChangeText={onChangeTeamB}
        style={[styles.input, { textAlign }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.bgGlass,
    borderRadius: r.card,
    padding: 18,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  title: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '700',
  },
  input: {
    backgroundColor: dark.bgGlass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: dark.textPrimary,
    ...textStyle.bodyPrimary,
  },
});
