import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { colors } from '../../../shared/theme/colors';
import { useGameStore } from '../store/useGameStore';
import { useLocale } from '../../../localization/useLocale';
import { Question } from '../types/game';
import { AppIcon } from '../../../shared/components/AppIcon';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectionBoard'>;

const BOARD_QUESTIONS_PER_SUBCATEGORY = 6;

interface BoardColumn {
  subId: string;
  name: string;
  questions: Question[];
}

export function SelectionBoardScreen({ navigation }: Props) {
  const { t } = useTranslation('game');
  const { isRTL, textAlign, rowLTR } = useLocale('game');
  const [showExitModal, setShowExitModal] = useState(false);

  const {
    questionDeck,
    selectedSubcategoryIds,
    teams,
    activeTeamId,
    answeredQuestionIds,
    selectBoardQuestion,
    endGame,
  } = useGameStore();

  // ── Board data ────────────────────────────────────────────────────────────
  const boardData = useMemo<BoardColumn[]>(() => {
    return selectedSubcategoryIds.map((subId) => {
      const questions = questionDeck
        .filter((q) => q.subcategoryId === subId)
        .sort((a, b) => a.points - b.points)
        .slice(0, BOARD_QUESTIONS_PER_SUBCATEGORY);

      return {
        subId,
        name: questions[0]?.subcategoryName ?? subId,
        questions,
      };
    });
  }, [questionDeck, selectedSubcategoryIds]);

  const boardQuestionIds = useMemo(
    () => new Set(boardData.flatMap((col) => col.questions.map((q) => q.id))),
    [boardData],
  );

  const boardAnsweredCount = useMemo(
    () => answeredQuestionIds.filter((id) => boardQuestionIds.has(id)).length,
    [answeredQuestionIds, boardQuestionIds],
  );

  const allAnswered =
    boardQuestionIds.size > 0 && boardAnsweredCount >= boardQuestionIds.size;

  // ── Navigate to Results when board is complete ────────────────────────────
  useEffect(() => {
    if (allAnswered) {
      navigation.replace('Results');
    }
  }, [allAnswered, navigation]);

  // ── Active team info ──────────────────────────────────────────────────────
  const activeTeam = teams[activeTeamId];
  const activeTeamAccent = activeTeamId === 'A' ? colors.teamA : colors.teamB;

  const handleCellPress = (questionId: string) => {
    selectBoardQuestion(questionId);
    navigation.replace('Question');
  };

  const isAnswered = (questionId: string) => answeredQuestionIds.includes(questionId);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <View style={[styles.topBar, { flexDirection: rowLTR }]}>
        <Pressable
          onPress={() => setShowExitModal(true)}
          style={({ pressed }) => [styles.endBtn, pressed && styles.endBtnPressed]}
          hitSlop={8}
        >
          <Text style={styles.endBtnText}>{t('board.end_game_btn')}</Text>
        </Pressable>

        {/* Active team turn indicator */}
        <View style={[styles.turnBadge, { borderColor: activeTeamAccent }]}>
          <View style={[styles.turnDot, { backgroundColor: activeTeamAccent }]} />
          <Text style={styles.turnText} numberOfLines={1}>
            {t('board.active_team', { name: activeTeam.name })}
          </Text>
        </View>
      </View>

      {/* ── Score cards ────────────────────────────────────────────────── */}
      <View style={[styles.scoreRow, { flexDirection: rowLTR }]}>
        {[teams.A, teams.B].map((team) => {
          const accent = team.id === 'A' ? colors.teamA : colors.teamB;
          const isActive = team.id === activeTeamId;
          return (
            <View
              key={team.id}
              style={[
                styles.scoreCard,
                isActive && { borderColor: accent, borderWidth: 2 },
              ]}
            >
              <Text style={[styles.scoreTeamName, { textAlign, color: isActive ? accent : colors.mutedText }]} numberOfLines={1}>
                {team.name}
              </Text>
              <Text style={[styles.scoreValue, { color: accent }]}>{team.score}</Text>
            </View>
          );
        })}
      </View>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: boardQuestionIds.size > 0
                ? `${(boardAnsweredCount / boardQuestionIds.size) * 100}%`
                : '0%',
            },
          ]}
        />
      </View>

      {/* ── Category sections ──────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {boardData.map((col) => {
          const colAnsweredCount = col.questions.filter((q) => isAnswered(q.id)).length;
          const colTotal = col.questions.length;

          return (
            <View key={col.subId} style={styles.categorySection}>
              {/* Category header */}
              <View style={[styles.categoryHeader, { flexDirection: rowLTR }]}>
                <View style={styles.categoryIconBubble}>
                  <AppIcon name="crown" size={18} color={colors.primary} weight="duotone" />
                </View>
                <Text style={[styles.categoryName, { textAlign, flex: 1 }]} numberOfLines={1}>
                  {col.name}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {colAnsweredCount}/{colTotal}
                  </Text>
                </View>
              </View>

              {/* Point chips — wrapping, right-aligned */}
              <View style={styles.chipsRow}>
                {col.questions.map((q) => {
                  const answered = isAnswered(q.id);
                  return (
                    <Pressable
                      key={q.id}
                      onPress={() => !answered && handleCellPress(q.id)}
                      disabled={answered}
                      style={({ pressed }) => [
                        styles.chip,
                        answered ? styles.chipAnswered : styles.chipActive,
                        pressed && !answered && styles.chipPressed,
                      ]}
                    >
                      {answered ? (
                        <>
                          <AppIcon name="check" size={20} color={colors.mutedText} weight="bold" />
                          <Text style={styles.chipAnsweredLabel}>{t('board.answered_label')}</Text>
                        </>
                      ) : (
                        <Text style={styles.chipPoints}>{q.points}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Bottom spacing */}
        <View style={styles.scrollPad} />
      </ScrollView>

      {/* ── Exit dialog ────────────────────────────────────────────────── */}
      <Modal
        transparent
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { textAlign }]}>{t('board.exit_dialog.title')}</Text>
            <Text style={[styles.modalBody, { textAlign }]}>{t('board.exit_dialog.body')}</Text>
            <View style={[styles.modalActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <PrimaryButton
                label={t('board.exit_dialog.cancel')}
                onPress={() => setShowExitModal(false)}
                style={styles.cancelBtn}
              />
              <PrimaryButton
                label={t('board.exit_dialog.confirm')}
                onPress={() => {
                  setShowExitModal(false);
                  endGame();
                  navigation.replace('Results');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CHIP_SIZE = 86;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Top bar ──────────────────────────────────────────────────────────────
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  endBtn: {
    backgroundColor: '#FFF1E9',
    borderColor: '#F0C7B5',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  endBtnPressed: { opacity: 0.8 },
  endBtnText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 14,
  },
  turnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
    maxWidth: 200,
  },
  turnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  turnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    flexShrink: 1,
  },

  // ── Score cards ──────────────────────────────────────────────────────────
  scoreRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  scoreTeamName: {
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
  },

  // ── Progress ─────────────────────────────────────────────────────────────
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // ── Category sections ────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  categorySection: {
    gap: 12,
  },
  categoryHeader: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  categoryIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  categoryName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  categoryBadge: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  categoryBadgeText: {
    color: colors.mutedText,
    fontWeight: '800',
    fontSize: 12,
  },

  // ── Point chips ──────────────────────────────────────────────────────────
  chipsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: '#2E6B8A',
  },
  chipAnswered: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  chipPoints: {
    color: '#F5C842',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  chipAnsweredLabel: {
    color: colors.mutedText,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Scroll padding ───────────────────────────────────────────────────────
  scrollPad: {
    height: 20,
  },

  // ── Exit modal ───────────────────────────────────────────────────────────
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
  },
  modalBody: {
    color: colors.mutedText,
    lineHeight: 22,
  },
  modalActions: {
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
});
