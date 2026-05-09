import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Screen } from '../../../shared/components/Screen';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { useGameStore } from '../store/useGameStore';
import { useLanguageStore } from '../../../localization/languageStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

export function FeedbackScreen({ navigation }: Props) {
  const { t } = useTranslation('game');
  const { isRTL } = useLanguageStore();
  const textAlign = isRTL ? 'right' : 'left';

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

  if (!roundFeedback) return null;

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
        <Text style={[styles.status, { color: accent, textAlign }]}>
          {roundFeedback.message}
        </Text>
        <Text style={[styles.points, { textAlign }]}>
          {t('feedback.points_earned', {
            team: teams[activeTeamId].name,
            points: roundFeedback.earnedPoints,
          })}
        </Text>
        {roundFeedback.usedAnswerReward ? (
          <Text style={[styles.reward, { textAlign }]}>{t('feedback.double_points')}</Text>
        ) : null}
        <Text style={[styles.progress, { textAlign }]}>
          {t('feedback.progress', {
            current: currentQuestionIndex + 1,
            total: questionDeck.length,
          })}
        </Text>
      </View>

      <PrimaryButton
        label={isLast ? t('feedback.final_results') : t('feedback.next_turn')}
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
  status: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  points: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  reward: { color: colors.primaryDark, fontWeight: '700' },
  progress: { marginTop: 10, color: colors.mutedText, fontSize: 15 },
});
