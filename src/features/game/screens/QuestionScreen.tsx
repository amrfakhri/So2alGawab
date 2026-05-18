import React, { useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Eye, ThumbsDown, ThumbsUp } from 'lucide-react-native';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { CastToTvModal } from '../../tv/CastToTvModal';
import { alpha, dark, gradients, r, radius, spacing, textStyle } from '../../../shared/theme/tokens';
import { AnswerOption } from '../components/AnswerOption';
import { AnswerRevealCard } from '../components/AnswerRevealCard';
import { CategoryPill } from '../components/CategoryPill';
import { FixedBottomBar } from '../components/FixedBottomBar';
import { GameBackdrop } from '../components/GameBackdrop';
import { GameButton } from '../components/GameButton';
import { GameHeader } from '../components/GameHeader';
import { LifelineBar } from '../components/LifelineBar';
import { QuestionMediaCard } from '../components/QuestionMediaCard';
import { QuestionPromptCard } from '../components/QuestionPromptCard';
import { TeamsVSandTimer } from '../components/TeamsVSandTimer';
import { QUESTION_DURATION_MS } from '../engine/gameEngine';
import { useGameStore } from '../store/useGameStore';
import { useLocale } from '../../../localization/useLocale';
import { updateGameSession } from '../../../services/supabase/sessionService';


type Props = NativeStackScreenProps<RootStackParamList, 'Question'>;

const HEADER_H    = 96;
const BOTTOM_BAR_H = 104;

export function QuestionScreen({ navigation }: Props) {
  const { t, textAlign } = useLocale('game');
  const insets = useSafeAreaInsets();

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
    tvSessionId,
    answerQuestion,
    revealAnswer,
    resolvePresenterAnswer,
    tickQuestionTimer,
    skipTimerAndReveal,
    useLifeline,
    advanceToNextTurn,
    completeSelectionQuestion,
    endGame,
  } = useGameStore();

  const [showExitModal, setShowExitModal] = React.useState(false);
  const [showCastModal, setShowCastModal] = React.useState(false);

  function handleMediaPlayingChange(playing: boolean) {
    if (!tvSessionId) return;
    updateGameSession(tvSessionId, { media_playing: playing }).catch(() => {});
  }

  const question       = questionDeck[currentQuestionIndex];
  const activeTeam     = teams[activeTeamId];
  const isPresenter    = question?.answerMode === 'presenter';

  useEffect(() => {
    if (phase === 'finished') navigation.replace('Results');
  }, [navigation, phase]);

  useEffect(() => {
    if (phase !== 'question') return;
    const id = setInterval(() => { tickQuestionTimer(250); }, 250);
    return () => clearInterval(id);
  }, [phase, tickQuestionTimer]);


  if (!question) return null;

  const totalQuestions  = questionDeck.length;
  const showAnswers     = !isPresenter && question.options.length > 1;
  const showReveal      = phase === 'answer_revealed' || phase === 'result';
  const isSelectionMode = gameMode === 'selection';

  const nextLabel = isSelectionMode
    ? t('back_to_board')
    : currentQuestionIndex + 1 === totalQuestions
      ? t('show_result')
      : t('next_question');

  // Unified bottom bar: covers every interactive phase
  const showBottomCTA =
    phase === 'question' ||
    phase === 'waiting_answer' ||
    (phase === 'answer_revealed' && isPresenter) ||
    phase === 'result';

  // Team meta for the VS bar — A is always primary (fixed position), B always secondary.
  // Only isActive/statusLabel change when turns switch; positions never swap.
  const primaryMeta = {
    name:        teams.A.name,
    score:       teams.A.score,
    statusLabel: activeTeamId === 'A' ? t('team_status.active') : t('team_status.waiting'),
    emoji:       teams.A.avatar,
    accent:      'gold' as const,
    isActive:    activeTeamId === 'A',
  };
  const secondaryMeta = {
    name:        teams.B.name,
    score:       teams.B.score,
    statusLabel: activeTeamId === 'B' ? t('team_status.active') : t('team_status.waiting'),
    emoji:       teams.B.avatar,
    accent:      'blue' as const,
    isActive:    activeTeamId === 'B',
  };

  return (
    <>
      <StatusBar style="light" />

      <GameBackdrop>
        {/* ── Scrollable body ──────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop:    insets.top + HEADER_H,
              paddingBottom: showBottomCTA
                ? insets.bottom + BOTTOM_BAR_H + 8
                : insets.bottom + 24,
            },
          ]}
        >
          {/* Teams VS timer row */}
          <TeamsVSandTimer
            primary={primaryMeta}
            secondary={secondaryMeta}
            remainingMs={remainingMs}
            durationMs={QUESTION_DURATION_MS}
            timerUnitLabel={t('timer_unit')}
          />

          {/* Category pill */}
          <CategoryPill
            pointsLabel={t('question_card.points', { points: question.points })}
            categoryName={question.subcategoryName}
          />

          {/* Question area — always visible; answer card appended on reveal */}
          <View style={styles.questionGroup}>
            {question.mediaUrl && question.mediaType && (
              <QuestionMediaCard
                key={question.id}
                mediaUrl={question.mediaUrl}
                mediaType={question.mediaType as 'image' | 'video' | 'audio'}
                onMediaPlayingChange={handleMediaPlayingChange}
              />
            )}
            <QuestionPromptCard
              eyebrow={t('question_eyebrow', { current: currentQuestionIndex + 1 })}
              prompt={question.prompt}
              hint={revealedHint}
              hintLabel={t('question_card.hint_label')}
            />
            {showReveal && (
              <AnswerRevealCard correctAnswerText={question.correctAnswerText} />
            )}
          </View>

          {/* MCQ answer options */}
          {showAnswers && (
            <View style={styles.answers}>
              {question.options.map((option, index) => {
                let revealState: 'correct' | 'wrong' | 'neutral' = 'neutral';
                if ((phase === 'result' || phase === 'answer_revealed') && roundFeedback) {
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
          )}

          {/* Lifeline bar — hidden after answer is revealed */}
          {!showReveal && (
            <View style={styles.lifelineCard}>
              <LinearGradient
                colors={gradients.cardGlass}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.lifelineBorder} />
              <LifelineBar team={activeTeam} onUseLifeline={useLifeline} />
            </View>
          )}

          {/* Round result feedback */}
          {phase === 'result' && roundFeedback && (
            <View style={styles.resultCard}>
              <Text style={[styles.resultStatus, { textAlign }]}>
                {roundFeedback.message}
              </Text>
              <Text style={[styles.resultPoints, { textAlign }]}>
                {t('result_points', {
                  team:   activeTeam.name,
                  points: roundFeedback.earnedPoints,
                })}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ── Header (fixed top) ────────────────────────────────────── */}
        <GameHeader
          roundLabel={`${currentQuestionIndex + 1}/${totalQuestions}`}
          castLabel={tvSessionId ? t('cast_status.active') : t('cast_status.inactive')}
          isCastActive={!!tvSessionId}
          onClose={() => setShowExitModal(true)}
          onPressCast={() => setShowCastModal(true)}
        />

      </GameBackdrop>

      {/* ── Bottom CTA (screen-level absolute — outside GameBackdrop) ── */}
      {showBottomCTA && (
        <FixedBottomBar>
          {/* question: one tap stops timer and reveals answer */}
          {phase === 'question' && (
            <GameButton
              label={t('reveal_answer_btn')}
              onPress={skipTimerAndReveal}
              icon={<Eye size={18} color={dark.textInverse} strokeWidth={2} />}
            />
          )}

          {/* waiting_answer: reveal the answer (works for both MCQ and presenter) */}
          {phase === 'waiting_answer' && (
            <GameButton
              label={t('reveal_answer_btn')}
              onPress={revealAnswer}
              icon={<Eye size={18} color={dark.textInverse} strokeWidth={2} />}
            />
          )}

          {/* answer_revealed (presenter): judge the oral answer */}
          {phase === 'answer_revealed' && isPresenter && (
            <View style={styles.judgeRow}>
              <GameButton
                label={t('presenter.wrong')}
                variant="error"
                onPress={() => resolvePresenterAnswer(false)}
                style={styles.judgeBtn}
                icon={<ThumbsDown size={18} color={dark.textPrimary} strokeWidth={2} />}
              />
              <GameButton
                label={t('presenter.correct')}
                variant="success"
                onPress={() => resolvePresenterAnswer(true)}
                style={styles.judgeBtn}
                icon={<ThumbsUp size={18} color={dark.textPrimary} strokeWidth={2} />}
              />
            </View>
          )}

          {/* result: advance to next turn / show results */}
          {phase === 'result' && (
            <GameButton
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
          )}
        </FixedBottomBar>
      )}

      {/* ── Cast to TV modal ──────────────────────────────────────── */}
      <CastToTvModal
        visible={showCastModal}
        onClose={() => setShowCastModal(false)}
      />

      {/* ── Exit modal ────────────────────────────────────────────── */}
      <Modal
        transparent
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { textAlign }]}>{t('exit_dialog.title')}</Text>
            <Text style={[styles.modalCopy,  { textAlign }]}>{t('exit_dialog.body')}</Text>
            <View style={styles.modalActions}>
              <PrimaryButton
                label={t('exit_dialog.cancel')}
                onPress={() => setShowExitModal(false)}
                style={styles.cancelButton}
              />
              <PrimaryButton
                label={t('exit_dialog.confirm')}
                onPress={() => { setShowExitModal(false); endGame(); }}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  judgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  judgeBtn: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  questionGroup: {
    gap: spacing.xs,
  },

  answers: {
    gap: spacing['2xs'],
  },

  lifelineCard: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    padding: spacing.sm,
  },
  lifelineBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: alpha.white[8],
  },

  resultCard: {
    backgroundColor: dark.bgGlass,
    borderRadius: r.card,
    padding: 18,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    gap: spacing['2xs'],
  },
  resultStatus: {
    color: dark.textPrimary,
    ...textStyle.titleSectionLg,
    fontWeight: '800',
  },
  resultPoints: {
    color: dark.textAccent,
    ...textStyle.bodyPrimary,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: dark.bgOverlay,
  },
  modalCard: {
    backgroundColor: dark.bgCard,
    borderRadius: r.card,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  modalTitle:   { color: dark.textPrimary,   ...textStyle.titleSectionLg, fontWeight: '800' },
  modalCopy:    { color: dark.textSecondary, ...textStyle.bodyPrimary,    lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: spacing.xs },
  confirmButton: { flex: 1 },
  cancelButton: {
    flex: 1,
    backgroundColor: dark.bgGlassStrong,
    borderWidth: 1,
    borderColor: dark.borderDefault,
  },
});
