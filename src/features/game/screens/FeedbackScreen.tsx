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

  const isLast = currentQuestionIndex + 1 === questionDeck.length;

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={[styles.status, { color: accent }]}>
          {roundFeedback.message}
        </Text>
        <Text style={styles.points}>
          حصل {teams[activeTeamId].name} على {roundFeedback.earnedPoints} نقطة
        </Text>
        {roundFeedback.usedAnswerReward ? (
          <Text style={styles.reward}>تم مضاعفة النقاط.</Text>
        ) : null}
        <Text style={styles.progress}>
          {currentQuestionIndex + 1} من {questionDeck.length} سؤال مكتمل
        </Text>
      </View>

      <PrimaryButton
        label={isLast ? 'عرض النتائج النهائية' : 'الدور التالي'}
        onPress={() => {
          advanceToNextTurn();
          navigation.replace(isLast ? 'Results' : 'Question');
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'right',
  },
  points: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'right',
  },
  reward: {
    color: colors.primaryDark,
    fontWeight: '700',
    textAlign: 'right',
  },
  progress: {
    marginTop: 10,
    color: colors.mutedText,
    fontSize: 15,
    textAlign: 'right',
  },
});
