import React, { useEffect, useMemo, useState } from 'react';
import {
  I18nManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Screen } from '../../../shared/components/Screen';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../shared/theme/colors';
import { AnswerOption } from '../components/AnswerOption';
import { AnswerRevealSection } from '../components/AnswerRevealSection';
import { LifelineBar } from '../components/LifelineBar';
import { PresenterControls } from '../components/PresenterControls';
import { QuestionCard } from '../components/QuestionCard';
import { useGameStore } from '../store/useGameStore';
import { QUESTION_DURATION_MS } from '../engine/gameEngine';
import {
  availableCategories,
  findSubcategoryById,
  isPresenterQuestion,
} from '../engine/matchBuilder';

type Props = NativeStackScreenProps<RootStackParamList, 'Question'>;

export function QuestionScreen({ navigation }: Props) {
  const {
    phase,
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
    useLifeline,
    advanceToNextTurn,
    endGame,
  } = useGameStore();
  const [showExitModal, setShowExitModal] = useState(false);

  const question = questionDeck[currentQuestionIndex];
  const activeTeam = teams[activeTeamId];
  const isPresenter = question ? isPresenterQuestion(question) : false;
  const categoryName = useMemo(
    () =>
      availableCategories.find((category) => category.id === question?.categoryId)?.name ??
      'الفئة',
    [question?.categoryId],
  );
  const subcategoryName = useMemo(
    () => findSubcategoryById(question?.subcategoryId ?? '')?.name ?? 'التصنيف',
    [question?.subcategoryId],
  );

  useEffect(() => {
    if (phase === 'finished') {
      navigation.replace('Results');
    }
  }, [navigation, phase]);

  useEffect(() => {
    if (phase !== 'question') {
      return;
    }

    const id = setInterval(() => {
      tickQuestionTimer(250);
    }, 250);

    return () => clearInterval(id);
  }, [phase, tickQuestionTimer]);

  if (!question) {
    return null;
  }

  const totalQuestions = questionDeck.length;
  const showAnswers = !isPresenter;
  const showReveal = isPresenter && (phase === 'answer_revealed' || phase === 'result');
  const shouldShowPresenterControls =
    isPresenter && (phase === 'waiting_answer' || phase === 'answer_revealed');
  const nextLabel =
    currentQuestionIndex + 1 === totalQuestions ? 'عرض النتيجة' : 'السؤال التالي';

  return (
    <>
      <Screen>
        <View style={styles.layout}>
          <View style={styles.topRow}>
            <View style={styles.topSlotLeft}>
              <Pressable
                onPress={() => setShowExitModal(true)}
                style={({ pressed }) => [
                  styles.endButton,
                  pressed && styles.endButtonPressed,
                ]}
              >
                <Text style={styles.endButtonText}>إنهاء اللعبة</Text>
              </Pressable>
            </View>

            <View style={styles.timerShell}>
              <Text style={styles.timerLabel}>الوقت</Text>
              <Text style={styles.timerValue}>
                {Math.ceil(remainingMs / 1000)}
              </Text>
            </View>

            <View style={styles.topSlotRight}>
              <Text style={styles.roundText}>
                الجولة {currentQuestionIndex + 1}/{totalQuestions}
              </Text>
              <Text style={styles.categoryText}>{subcategoryName}</Text>
            </View>
          </View>

          <View style={styles.bodyRow}>
            <View style={styles.mainColumn}>
              <QuestionCard
                categoryName={categoryName}
                subcategoryName={subcategoryName}
                question={question}
                hint={revealedHint}
              />

              {isPresenter && phase === 'question' ? (
                <View style={styles.presenterNotice}>
                  <Text style={styles.presenterNoticeText}>
                    هذا السؤال بنظام المقدم. أجب شفهيا قبل انتهاء الوقت.
                  </Text>
                </View>
              ) : null}

              {showAnswers ? (
                <View style={styles.answers}>
                  {question.options.map((option, index) => {
                    let revealState: 'correct' | 'wrong' | 'neutral' = 'neutral';
                    if (phase === 'result' && roundFeedback) {
                      if (index === roundFeedback.correctIndex) {
                        revealState = 'correct';
                      } else if (index === roundFeedback.selectedAnswerIndex) {
                        revealState = 'wrong';
                      }
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

              {showReveal ? (
                <AnswerRevealSection
                  answer={question.options[question.correctIndex] ?? ''}
                />
              ) : null}

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
                  <Text style={styles.resultStatus}>{roundFeedback.message}</Text>
                  <Text style={styles.resultPoints}>
                    {activeTeam.name} حصل على {roundFeedback.earnedPoints} نقطة
                  </Text>
                  <PrimaryButton
                    label={nextLabel}
                    onPress={() => advanceToNextTurn()}
                  />
                </View>
              ) : null}
            </View>

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
                    <Text style={[styles.teamCardScore, { color: accent }]}>
                      {team.score}
                    </Text>
                  </View>
                );
              })}

              <View style={styles.lifelinePanel}>
                <Text style={styles.panelTitle}>وسائل المساعدة</Text>
                <LifelineBar team={activeTeam} onUseLifeline={useLifeline} vertical />
              </View>

              <View style={styles.footerMeta}>
                <Text style={styles.footerMetaLabel}>الفئة الحالية</Text>
                <Text style={styles.footerMetaValue}>{categoryName}</Text>
              </View>
            </View>
          </View>
        </View>
      </Screen>

      <Modal
        transparent
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>هل تريد إنهاء اللعبة؟</Text>
            <Text style={styles.modalCopy}>
              سيتم حفظ النقاط الحالية والانتقال إلى شاشة النتائج.
            </Text>
            <View style={styles.modalActions}>
              <PrimaryButton
                label="إلغاء"
                onPress={() => setShowExitModal(false)}
                style={styles.cancelButton}
              />
              <PrimaryButton
                label="إنهاء"
                onPress={() => {
                  setShowExitModal(false);
                  endGame();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topSlotLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  topSlotRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  timerShell: {
    minWidth: 110,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    gap: 2,
  },
  timerLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '700',
  },
  timerValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  roundText: {
    color: colors.mutedText,
    fontWeight: '700',
  },
  categoryText: {
    color: colors.secondary,
    fontWeight: '800',
  },
  endButton: {
    backgroundColor: '#FFF1E9',
    borderColor: '#F0C7B5',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  endButtonPressed: {
    opacity: 0.8,
  },
  endButtonText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 14,
  },
  bodyRow: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    gap: 14,
  },
  mainColumn: {
    flex: 1,
    gap: 14,
  },
  sidebar: {
    width: 132,
    gap: 12,
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  teamCardTitle: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
  teamCardScore: {
    fontSize: 30,
    fontWeight: '900',
  },
  lifelinePanel: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  panelTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  footerMeta: {
    backgroundColor: '#F2E7DB',
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  footerMetaLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  footerMetaValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  presenterNotice: {
    backgroundColor: '#FFF5EA',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1D8C5',
  },
  presenterNoticeText: {
    color: colors.primaryDark,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 22,
  },
  answers: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  resultStatus: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultPoints: {
    color: colors.secondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    gap: 16,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalCopy: {
    color: colors.mutedText,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
});
