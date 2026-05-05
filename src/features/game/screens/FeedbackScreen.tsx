import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Screen } from '../../../shared/components/Screen';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { useGameStore } from '../store/useGameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

export function FeedbackScreen({ navigation }: Props) {
  const {
    phase,
    roundFeedback,
    teams,
    activeTeamId,
    currentQuestionIndex,
    questionDeck,
    advanceToNextTurn,
  } = useGameStore();

  useEffect(() => {
    if (phase === 'finished') {
      navigation.replace('Results');
    }
  }, [navigation, phase]);

  if (!roundFeedback) {
    return null;
  }

  const accent =
    roundFeedback.status === 'correct'
      ? colors.success
      : roundFeedback.status === 'skipped'
        ? colors.warning
        : colors.danger;

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={[styles.status, { color: accent }]}>
          {roundFeedback.status.toUpperCase()}
        </Text>
        <Text style={styles.title}>{roundFeedback.message}</Text>
        <Text style={styles.points}>
          {teams[activeTeamId].name} earned {roundFeedback.earnedPoints} points
        </Text>
        {roundFeedback.usedAnswerReward ? (
          <Text style={styles.reward}>Answer Reward doubled this score.</Text>
        ) : null}
        <Text style={styles.progress}>
          Completed {currentQuestionIndex + 1} of {questionDeck.length} questions
        </Text>
      </View>

      <PrimaryButton
        label={
          currentQuestionIndex + 1 === questionDeck.length
            ? 'See Final Results'
            : 'Next Turn'
        }
        onPress={() => {
          advanceToNextTurn();
          navigation.replace(
            currentQuestionIndex + 1 === questionDeck.length ? 'Results' : 'Question',
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    gap: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.text,
  },
  points: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  reward: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  progress: {
    marginTop: 10,
    color: colors.mutedText,
    fontSize: 15,
  },
});
