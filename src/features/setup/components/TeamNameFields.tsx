import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../shared/theme/colors';
import { useLanguageStore } from '../../../localization/languageStore';

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
        placeholderTextColor={colors.mutedText}
        value={teamAName}
        onChangeText={onChangeTeamA}
        style={[styles.input, { textAlign }]}
      />
      <TextInput
        placeholder={t('teams.team_b_placeholder')}
        placeholderTextColor={colors.mutedText}
        value={teamBName}
        onChangeText={onChangeTeamB}
        style={[styles.input, { textAlign }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
});
