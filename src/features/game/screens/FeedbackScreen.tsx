import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Screen } from '../../../shared/components/Screen';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { light, r, spacing, textStyle } from '../../../shared/theme/tokens';
import { useGameStore } from '../store/useGameStore';
import { useLocale } from '../../../localization/useLocale';
import { StatusBar } from 'expo-status-bar';

type Props = NativeStackScreenProps<RootStackParamList, 'Feedback'>;

export function FeedbackScreen({ navigation }: Props) {
  const { t, textAlign } = useLocale('game');

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
      ? light.textSuccess
      : roundFeedback.status === 'skipped'
        ? light.textWarning
        : light.textError;

  const isLast = currentQuestionIndex + 1 === questionDeck.length;

  return (
    <Screen>
      <StatusBar style="dark" />
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
    backgroundColor: light.bgCard,
    borderRadius: r.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: light.borderSubtle,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  status:   { ...textStyle.titlePage, lineHeight: 34, fontWeight: '800' },
  points:   { ...textStyle.titleSectionSm, fontWeight: '700', color: light.secondary },
  reward:   { color: light.textAccentDark, fontWeight: '700' },
  progress: { marginTop: 10, color: light.textSecondary, ...textStyle.bodySm },
});
