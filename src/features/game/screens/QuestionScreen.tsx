import React, { useEffect, useMemo, useState } from 'react';
import {
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { AnswerOption } from '../components/AnswerOption';
import { AnswerRevealSection } from '../components/AnswerRevealSection';
import { LifelineBar } from '../components/LifelineBar';
import { PresenterControls } from '../components/PresenterControls';
import { QuestionCard } from '../components/QuestionCard';
import { useGameStore } from '../store/useGameStore';
import { useLanguageStore } from '../../../localization/languageStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Question'>;

export function QuestionScreen({ navigation }: Props) {
  const { t } = useTranslation('game');
  const { isRTL } = useLanguageStore();
  const {
    phase,
    gameMode,
    teams,
    activeTeamId,
    questionDeck,
    currentQuestionIndex,
    remainingMs,
    revealedHint,
    selectedAnswerIndex,
    roundFeedback,
    answerQuestion,
    revealPresenterAnswer,
    resolvePresenterAnswer,
    tickQuestionTimer,
    skipTimer,
    useLifeline,
    advanceToNextTurn,
    completeSelectionQuestion,
    endGame,
  } = useGameStore();
  const [showExitModal, setShowExitModal] = useState(false);
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const question = questionDeck[currentQuestionIndex];
  const activeTeam = teams[activeTeamId];
  const isPresenter = question?.answerMode === 'presenter';
  const categoryName = useMemo(() => question?.categoryName ?? '', [question?.categoryName]);
  const subcategoryName = useMemo(() => question?.subcategoryName ?? '', [question?.subcategoryName]);

  useEffect(() => {
    if (phase === 'finished') {
      navigation.replace('Results');
    }
  }, [navigation, phase]);

  useEffect(() => {
    if (phase !== 'question') return;
    const id = setInterval(() => { tickQuestionTimer(250); }, 250);
    return () => clearInterval(id);
  }, [phase, tickQuestionTimer]);

  if (!question) return null;

  const totalQuestions = questionDeck.length;
  const showAnswers = !isPresenter && question.options.length > 1;
  const showReveal = isPresenter && (phase === 'answer_revealed' || phase === 'result');
  const shouldShowPresenterControls =
    isPresenter && (phase === 'waiting_answer' || phase === 'answer_revealed');
  const isSelectionMode = gameMode === 'selection';
  const nextLabel = isSelectionMode
    ? t('back_to_board')
    : currentQuestionIndex + 1 === totalQuestions
      ? t('show_result')
      : t('next_question');
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.layout}>
          {/* Top row */}
          <View style={styles.topRow}>
            <View style={styles.topSlotStart}>
              <Pressable
                onPress={() => setShowExitModal(true)}
                style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
              >
                <Text style={styles.endButtonText}>{t('end_game_btn')}</Text>
              </Pressable>
            </View>

            <View style={styles.timerShell}>
              <Text style={styles.timerLabel}>{t('timer_label')}</Text>
              <Text style={styles.timerValue}>{Math.ceil(remainingMs / 1000)}</Text>
            </View>

            <View style={styles.topSlotEnd}>
              <Text style={[styles.roundText, { textAlign }]}>
                {t('round', { current: currentQuestionIndex + 1, total: totalQuestions })}
              </Text>
              <Text style={[styles.categoryText, { textAlign }]}>{subcategoryName}</Text>
            </View>
          </View>

          {/* Portrait: compact team scores + lifelines */}
          {isPortrait ? (
            <View style={styles.portraitBar}>
              <View style={styles.portraitTeams}>
                {[teams.A, teams.B].map((team) => {
                  const accent = team.id === 'A' ? colors.teamA : colors.teamB;
                  const active = team.id === activeTeamId;
                  return (
                    <View
                      key={team.id}
                      style={[
                        styles.portraitTeamCard,
                        active && { borderColor: accent, borderWidth: 2 },
                      ]}
                    >
                      <Text style={[styles.portraitTeamName, { textAlign }]}>{team.name}</Text>
                      <Text style={[styles.portraitTeamScore, { color: accent }]}>
                        {team.score}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.portraitLifelines}>
                <Text style={[styles.portraitLifelinesLabel, { textAlign }]}>
                  {t('lifelines_title')}
                </Text>
                <LifelineBar team={activeTeam} onUseLifeline={useLifeline} />
              </View>
            </View>
          ) : null}

          {/* Body row */}
          <View style={[styles.bodyRow, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
            <View style={styles.mainColumn}>
              <QuestionCard
                categoryName={categoryName}
                subcategoryName={subcategoryName}
                question={question}
                hint={revealedHint}
              />

              {isPresenter && phase === 'question' ? (
                <View style={styles.presenterNotice}>
                  <Text style={[styles.presenterNoticeText, { textAlign }]}>
                    {t('presenter_notice')}
                  </Text>
                </View>
              ) : null}

              {phase === 'question' ? (
                <Pressable
                  onPress={skipTimer}
                  style={({ pressed }) => [
                    styles.revealButton,
                    pressed && styles.revealButtonPressed,
                  ]}
                >
                  <Text style={styles.revealButtonText}>{t('reveal_answer_btn')}</Text>
                </Pressable>
              ) : null}

              {showAnswers ? (
                <View style={styles.answers}>
                  {question.options.map((option, index) => {
                    let revealState: 'correct' | 'wrong' | 'neutral' = 'neutral';
                    if (phase === 'result' && roundFeedback) {
                      if (index === roundFeedback.correctIndex) revealState = 'correct';
                      else if (index === roundFeedback.selectedAnswerIndex) revealState = 'wrong';
                    }
                    return (
                      <AnswerOption
                        key={`${question.id}-${option}`}
                        label={option}
                        isSelected={selectedAnswerIndex === index}
                        revealState={revealState}
                        isDisabled={phase !== 'question' || isPresenter}
                        onPress={() => answerQuestion(index)}
                      />
                    );
                  })}
                </View>
              ) : null}

              {showReveal ? <AnswerRevealSection answer={question.correctAnswerText} /> : null}

              {shouldShowPresenterControls ? (
                <PresenterControls
                  phase={phase}
                  onReveal={revealPresenterAnswer}
                  onMarkCorrect={() => resolvePresenterAnswer(true)}
                  onMarkWrong={() => resolvePresenterAnswer(false)}
                />
              ) : null}

              {phase === 'result' && roundFeedback ? (
                <View style={styles.resultCard}>
                  <Text style={[styles.resultStatus, { textAlign }]}>{roundFeedback.message}</Text>
                  <Text style={[styles.resultPoints, { textAlign }]}>
                    {t('result_points', { team: activeTeam.name, points: roundFeedback.earnedPoints })}
                  </Text>
                  <PrimaryButton
                    label={nextLabel}
                    onPress={() => {
                      if (isSelectionMode) {
                        completeSelectionQuestion();
                        navigation.replace('SelectionBoard');
                      } else {
                        advanceToNextTurn();
                      }
                    }}
                  />
                </View>
              ) : null}
            </View>

            {/* Landscape sidebar */}
            {!isPortrait ? (
              <View style={styles.sidebar}>
                {[teams.A, teams.B].map((team) => {
                  const accent = team.id === 'A' ? colors.teamA : colors.teamB;
                  const active = team.id === activeTeamId;
                  return (
                    <View
                      key={team.id}
                      style={[
                        styles.teamCard,
                        active && { borderColor: accent, borderWidth: 2 },
                      ]}
                    >
                      <Text style={styles.teamCardTitle}>{team.name}</Text>
                      <Text style={[styles.teamCardScore, { color: accent }]}>{team.score}</Text>
                    </View>
                  );
                })}

                <View style={styles.lifelinePanel}>
                  <Text style={styles.panelTitle}>{t('lifelines_title')}</Text>
                  <LifelineBar team={activeTeam} onUseLifeline={useLifeline} vertical />
                </View>

                <View style={styles.footerMeta}>
                  <Text style={styles.footerMetaLabel}>{t('current_category')}</Text>
                  <Text style={styles.footerMetaValue}>{categoryName}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        transparent
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { textAlign }]}>{t('exit_dialog.title')}</Text>
            <Text style={[styles.modalCopy, { textAlign }]}>{t('exit_dialog.body')}</Text>
            <View style={[styles.modalActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <PrimaryButton
                label={t('exit_dialog.cancel')}
                onPress={() => setShowExitModal(false)}
                style={styles.cancelButton}
              />
              <PrimaryButton
                label={t('exit_dialog.confirm')}
                onPress={() => { setShowExitModal(false); endGame(); }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  layout: { padding: 20, gap: 18 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topSlotStart: { flex: 1, alignItems: 'flex-start' },
  topSlotEnd: { flex: 1, alignItems: 'flex-end', gap: 4 },
  timerShell: {
    minWidth: 110,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    gap: 2,
  },
  timerLabel: { color: '#D1D5DB', fontSize: 12, fontWeight: '700' },
  timerValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  roundText: { color: colors.mutedText, fontWeight: '700' },
  categoryText: { color: colors.secondary, fontWeight: '800' },
  endButton: {
    backgroundColor: '#FFF1E9',
    borderColor: '#F0C7B5',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  endButtonPressed: { opacity: 0.8 },
  endButtonText: { color: colors.danger, fontWeight: '800', fontSize: 14 },
  portraitBar: { gap: 10 },
  portraitTeams: { flexDirection: 'row', gap: 10 },
  portraitTeamCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portraitTeamName: { color: colors.text, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  portraitTeamScore: { fontSize: 22, fontWeight: '900', marginStart: 8 },
  portraitLifelines: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  portraitLifelinesLabel: { color: colors.text, fontWeight: '800', fontSize: 13 },
  bodyRow: { gap: 14 },
  mainColumn: { flex: 1, gap: 14 },
  sidebar: { width: 132, gap: 12 },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  teamCardTitle: { color: colors.text, fontWeight: '700', textAlign: 'center', fontSize: 14 },
  teamCardScore: { fontSize: 30, fontWeight: '900' },
  lifelinePanel: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  panelTitle: { color: colors.text, fontWeight: '800', fontSize: 14, textAlign: 'center' },
  footerMeta: { backgroundColor: '#F2E7DB', borderRadius: 18, padding: 12, gap: 4 },
  footerMetaLabel: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  footerMetaValue: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  presenterNotice: {
    backgroundColor: '#FFF5EA',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1D8C5',
  },
  presenterNoticeText: { color: colors.primaryDark, fontWeight: '700', lineHeight: 22 },
  revealButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  revealButtonPressed: { backgroundColor: '#F2E7DB', borderColor: colors.primary },
  revealButtonText: { color: colors.primaryDark, fontWeight: '700', fontSize: 15 },
  answers: { gap: 12 },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  resultStatus: { color: colors.text, fontSize: 22, fontWeight: '800' },
  resultPoints: { color: colors.secondary, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
  },
  modalCard: { backgroundColor: colors.card, borderRadius: 24, padding: 22, gap: 16 },
  modalTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  modalCopy: { color: colors.mutedText, lineHeight: 22 },
  modalActions: { gap: 12 },
  cancelButton: { flex: 1, backgroundColor: colors.secondary },
});
