import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Screen } from '../../../shared/components/Screen';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useGameStore } from '../../game/store/useGameStore';
import { colors } from '../../../shared/theme/colors';
import { useLanguageStore } from '../../../localization/languageStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({ navigation }: Props) {
  const { t } = useTranslation('game');
  const { isRTL } = useLanguageStore();
  const textAlign = isRTL ? 'right' : 'left';

  const { teams, resetGame, questionDeck, endedEarly } = useGameStore();

  const winner =
    teams.A.score === teams.B.score
      ? null
      : teams.A.score > teams.B.score
        ? teams.A
        : teams.B;

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { textAlign }]}>
          {endedEarly ? t('results.ended_early_eyebrow') : t('results.game_over_eyebrow')}
        </Text>
        <Text style={[styles.title, { textAlign }]}>
          {winner ? t('results.winner_title', { name: winner.name }) : t('results.draw_title')}
        </Text>
        <Text style={[styles.subtitle, { textAlign }]}>
          {endedEarly
            ? t('results.subtitle_early')
            : t('results.subtitle', { count: questionDeck.length })}
        </Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.teamName}>{teams.A.name}</Text>
            <Text style={[styles.score, { color: colors.teamA }]}>{teams.A.score}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.teamName}>{teams.B.name}</Text>
            <Text style={[styles.score, { color: colors.teamB }]}>{teams.B.score}</Text>
          </View>
        </View>

        <PrimaryButton
          label={t('results.new_game')}
          onPress={() => {
            resetGame();
            navigation.replace('GameSetup');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 18 },
  eyebrow: { color: colors.primary, fontWeight: '800' },
  title: { color: colors.text, fontSize: 32, lineHeight: 38, fontWeight: '800' },
  subtitle: { color: colors.mutedText, fontSize: 16, lineHeight: 22 },
  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  teamName: { color: colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  score: { fontSize: 36, fontWeight: '900', textAlign: 'center' },
});
