import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Screen } from '../../../shared/components/Screen';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useGameStore } from '../../game/store/useGameStore';
import { colors } from '../../../shared/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({ navigation }: Props) {
  const {
    teams,
    resetGame,
    questionDeck,
    endedEarly,
  } = useGameStore();

  const winner =
    teams.A.score === teams.B.score
      ? null
      : teams.A.score > teams.B.score
        ? teams.A
        : teams.B;

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          {endedEarly ? 'Game Ended Early' : 'Match Complete'}
        </Text>
        <Text style={styles.title}>
          {winner ? `${winner.name} wins` : 'It ends in a draw'}
        </Text>
        <Text style={styles.subtitle}>
          {endedEarly
            ? 'Current score at the time the game was ended.'
            : `Final score after ${questionDeck.length} questions.`}
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
          label="Play Again"
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 22,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  score: {
    marginTop: 10,
    fontSize: 36,
    fontWeight: '900',
  },
});
