import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';

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
  return (
    <View style={styles.card}>
      <Text style={styles.title}>أسماء الفرق</Text>
      <TextInput
        placeholder="اسم الفريق الأول"
        placeholderTextColor={colors.mutedText}
        value={teamAName}
        onChangeText={onChangeTeamA}
        style={styles.input}
        textAlign="right"
      />
      <TextInput
        placeholder="اسم الفريق الثاني"
        placeholderTextColor={colors.mutedText}
        value={teamBName}
        onChangeText={onChangeTeamB}
        style={styles.input}
        textAlign="right"
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
    textAlign: 'right',
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
