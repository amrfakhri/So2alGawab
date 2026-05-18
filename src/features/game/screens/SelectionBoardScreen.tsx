import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import {
  alpha,
  dark,
  glow,
  gradients,
  radius,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';
import { useGameStore } from '../store/useGameStore';
import { useLocale } from '../../../localization/useLocale';
import { Question } from '../types/game';
import { GameBackdrop } from '../components/GameBackdrop';
import { FixedBottomBar } from '../components/FixedBottomBar';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { AppIcon } from '../../../shared/components/AppIcon';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectionBoard'>;

const BOARD_QUESTIONS_PER_SUBCATEGORY = 6;
const HEADER_H = 120;
const CHIP_W = 68;
const CHIP_H = 72;
const CAT_CARD_PAD = spacing.md;

interface BoardColumn {
  subId: string;
  name: string;
  imageUrl?: string;
  questions: Question[];
}

export function SelectionBoardScreen({ navigation }: Props) {
  const { t, textAlign } = useLocale('game');
  const insets = useSafeAreaInsets();
  const [showExitModal, setShowExitModal] = useState(false);

  const {
    questionDeck,
    selectedSubcategoryIds,
    availableCategories,
    teams,
    activeTeamId,
    answeredQuestionIds,
    selectBoardQuestion,
    endGame,
  } = useGameStore();

  const subcategoryImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of availableCategories) {
      for (const sub of cat.subcategories) {
        if (sub.image) map[sub.id] = sub.image;
      }
    }
    return map;
  }, [availableCategories]);

  const boardData = useMemo<BoardColumn[]>(() => {
    return selectedSubcategoryIds.map((subId) => {
      const questions = questionDeck
        .filter((q) => q.subcategoryId === subId)
        .sort((a, b) => a.points - b.points)
        .slice(0, BOARD_QUESTIONS_PER_SUBCATEGORY);

      return {
        subId,
        name: questions[0]?.subcategoryName ?? subId,
        imageUrl: subcategoryImageMap[subId],
        questions,
      };
    });
  }, [questionDeck, selectedSubcategoryIds, subcategoryImageMap]);

  const boardQuestionIds = useMemo(
    () => new Set(boardData.flatMap((col) => col.questions.map((q) => q.id))),
    [boardData],
  );

  const boardAnsweredCount = useMemo(
    () => answeredQuestionIds.filter((id) => boardQuestionIds.has(id)).length,
    [answeredQuestionIds, boardQuestionIds],
  );

  const allAnswered = boardQuestionIds.size > 0 && boardAnsweredCount >= boardQuestionIds.size;

  useEffect(() => {
    if (allAnswered) navigation.replace('Results');
  }, [allAnswered, navigation]);

  const activeTeam = teams[activeTeamId];
  const isTeamAActive = activeTeamId === 'A';
  const remainingCount = boardQuestionIds.size - boardAnsweredCount;
  const isAnswered = (id: string) => answeredQuestionIds.includes(id);

  const handleCellPress = (questionId: string) => {
    selectBoardQuestion(questionId);
    navigation.replace('Question');
  };

  // Team-specific color helpers
  function teamBg(id: 'A' | 'B', isActive: boolean) {
    if (!isActive) return id === 'A' ? [alpha.white[8], alpha.white[8]] as const : gradients.cardGlass;
    return id === 'A' ? gradients.teamGold : gradients.teamBlue;
  }
  function teamBorderColor(id: 'A' | 'B', isActive: boolean) {
    if (!isActive) return dark.borderDefault;
    return id === 'A' ? dark.borderActiveMuted : dark.borderFocusRing;
  }
  function teamAvatarBg(id: 'A' | 'B', isActive: boolean) {
    if (!isActive) return alpha.white[16];
    return id === 'A' ? dark.bgAccent : dark.bgHighlight;
  }
  function teamStatusColor(id: 'A' | 'B', isActive: boolean) {
    if (!isActive) return dark.textSecondary;
    return id === 'A' ? dark.textAccent : dark.textHighlight;
  }
  function teamDividerColor(id: 'A' | 'B', isActive: boolean) {
    if (!isActive) return alpha.white[40];
    return id === 'A' ? alpha.gold[40] : alpha.blue[40];
  }

  return (
    <>
      <GameBackdrop>
        {/* ── Scrollable body ─────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + HEADER_H,
              paddingBottom: insets.bottom + 128,
            },
          ]}
        >
          {/* ── Team score cards ─────────────────────────────────── */}
          <View style={styles.scoreRow}>
            {[teams.A, teams.B].map((team) => {
              const isActive = team.id === activeTeamId;
              const id = team.id as 'A' | 'B';
              return (
                <View key={team.id} style={styles.scoreCard}>
                  <LinearGradient
                    colors={teamBg(id, isActive)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    style={[
                      styles.scoreCardBorder,
                      { borderColor: teamBorderColor(id, isActive) },
                    ]}
                  />

                  {/* Card content — column */}
                  <View style={styles.scoreCardContent}>
                    {/* Team details row: avatar (right) + text (left) */}
                    <View style={styles.scoreTeamRow}>
                      {/* Avatar — first = rightmost in RTL */}
                      <View
                        style={[
                          styles.scoreAvatar,
                          { backgroundColor: teamAvatarBg(id, isActive) },
                        ]}
                      >
                        <Text style={styles.scoreAvatarEmoji}>{team.avatar}</Text>
                      </View>
                      {/* Name + status */}
                      <View style={styles.scoreTeamText}>
                        <Text
                          style={[styles.scoreName, { color: dark.textPrimary }]}
                          numberOfLines={1}
                        >
                          {team.name}
                        </Text>
                        <Text
                          style={[
                            styles.scoreStatus,
                            { color: teamStatusColor(id, isActive) },
                          ]}
                        >
                          {isActive ? t('team_status.active') : t('team_status.waiting')}
                        </Text>
                      </View>
                    </View>

                    {/* Team-coloured gradient divider */}
                    <LinearGradient
                      colors={[teamDividerColor(id, isActive), 'transparent']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={styles.scoreDividerLine}
                    />

                    {/* Score */}
                    <Text style={[styles.scoreValue, { color: dark.textPrimary, textAlign }]}>
                      {team.score}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Category question cards ───────────────────────────── */}
          {boardData.map((col) => {
            const colAnswered = col.questions.filter((q) => isAnswered(q.id)).length;
            return (
              <View key={col.subId} style={styles.categoryCard}>
                <View style={styles.categoryCardBg} />
                <View style={styles.categoryCardBorder} />

                {/* Header row */}
                <View style={styles.catHeaderRow}>
                  {col.imageUrl ? (
                    <Image
                      source={{ uri: col.imageUrl }}
                      style={styles.catThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.catThumb, styles.catThumbFallback]}>
                      <AppIcon name="crown" size={18} color={dark.iconAccent} weight="duotone" />
                    </View>
                  )}
                  <Text style={styles.catName} numberOfLines={1}>
                    {col.name}
                  </Text>
                  <Text style={styles.catCount}>
                    {colAnswered}/{col.questions.length}
                  </Text>
                </View>

                {/* Neutral gradient divider */}
                <LinearGradient
                  colors={['transparent', alpha.white[40], 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.catDivider}
                />

                {/* ── Chips — horizontal scroll ─────────────────── */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipsScroll}
                  contentContainerStyle={styles.chipsScrollContent}
                >
                  {col.questions.map((q) => {
                    const answered = isAnswered(q.id);
                    return (
                      <Pressable
                        key={q.id}
                        onPress={() => !answered && handleCellPress(q.id)}
                        disabled={answered}
                        style={({ pressed }) => [
                          styles.chip,
                          answered ? styles.chipAnswered : styles.chipAvailable,
                          pressed && !answered && styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipPoints,
                            { color: answered ? dark.textDisabled : dark.textInverse },
                          ]}
                        >
                          {q.points}
                        </Text>
                        <Text
                          style={[
                            styles.chipUnit,
                            { color: answered ? dark.textDisabled : dark.textInverse },
                          ]}
                        >
                          {t('board.points_unit')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>

        {/* ── Fixed header ────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.headerBorder} />
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => setShowExitModal(true)}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.75 }]}
              hitSlop={8}
            >
              <LinearGradient
                colors={[alpha.white[8], alpha.white[4]]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.closeBtnBorder} />
              <AppIcon name="close" size={18} color={dark.textSecondary} weight="bold" />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerEyebrow}>
                {t('board.turn', {
                  current: Math.min(boardAnsweredCount + 1, boardQuestionIds.size),
                  total: boardQuestionIds.size,
                })}
              </Text>
              <Text style={styles.headerTitle}>{t('board.choose_question')}</Text>
            </View>

            {/* Balance spacer matches close button width */}
            <View style={styles.closeBtn} />
          </View>
        </View>
      </GameBackdrop>

      {/* ── Fixed bottom bar ──────────────────────────────────────── */}
      <FixedBottomBar>
        {/* Active team pill — team-coloured gradient, pill shape */}
        <View style={styles.activeTeamPill}>
          <LinearGradient
            colors={isTeamAActive ? gradients.teamGold : gradients.teamBlue}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.activeTeamPillBorder,
              {
                borderColor: isTeamAActive
                  ? dark.borderActiveMuted
                  : dark.borderFocusRing,
              },
            ]}
          />

          {/* Avatar — first = rightmost in RTL */}
          <View
            style={[
              styles.pillAvatar,
              {
                backgroundColor: isTeamAActive ? dark.bgAccent : dark.bgHighlight,
              },
            ]}
          >
            <Text style={styles.pillAvatarEmoji}>{activeTeam.avatar}</Text>
          </View>

          {/* Name + subtitle — flex 1, fills middle */}
          <View style={styles.pillMeta}>
            <Text style={styles.pillName} numberOfLines={1}>
              {t('board.active_team', { name: activeTeam.name })}
            </Text>
            <Text style={styles.pillSub} numberOfLines={1}>
              {t('board.choose_subtitle')}
            </Text>
          </View>

          {/* Remaining count — last = leftmost in RTL */}
          <Text
            style={[
              styles.pillRemaining,
              { color: isTeamAActive ? dark.textAccent : dark.textHighlight },
            ]}
            numberOfLines={1}
          >
            {t('board.remaining', { count: remainingCount })}
          </Text>
        </View>
      </FixedBottomBar>

      {/* ── Exit modal ────────────────────────────────────────────── */}
      <Modal
        transparent
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { textAlign }]}>
              {t('board.exit_dialog.title')}
            </Text>
            <Text style={[styles.modalBody, { textAlign }]}>
              {t('board.exit_dialog.body')}
            </Text>
            <View style={styles.modalActions}>
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
                style={styles.confirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  // ── Score cards — side-by-side ROW layout ────────────────────────────────
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreCard: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  scoreCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    borderWidth: 0.5,
  },
  scoreCardContent: {
    padding: spacing.sm,
    gap: spacing['2xs'],
  },
  scoreTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  // Avatar is first child → appears on the RIGHT in RTL via I18nManager
  scoreAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  scoreAvatarEmoji: {
    fontSize: 18,
  },
  scoreTeamText: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-start',
  },
  scoreName: {
    ...textStyle.buttonSm,
    fontWeight: '700',
    textAlign: 'auto',
  },
  scoreStatus: {
    ...textStyle.labelSm,
    textAlign: 'auto',
  },
  // Gradient fades from team colour (right) to transparent (left)
  scoreDividerLine: {
    height: 1,
  },
  scoreValue: {
    ...textStyle.titleSectionMd,
    fontWeight: '700',
  },

  // ── Category cards ───────────────────────────────────────────────────────
  categoryCard: {
    borderRadius: radius.lg,
    padding: CAT_CARD_PAD,
    gap: spacing.sm,
  },
  categoryCardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.lg,
  },
  categoryCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: alpha.white[8],
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  catThumb: {
    width: 45,
    height: 36,
    borderRadius: radius.md,
    flexShrink: 0,
    overflow: 'hidden',
  },
  catThumbFallback: {
    backgroundColor: alpha.gold[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
    flex: 1,
    textAlign: 'auto',
  },
  catCount: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
    flexShrink: 0,
    textAlign: 'auto',
  },
  catDivider: {
    height: 1,
    marginHorizontal: -CAT_CARD_PAD,
  },

  // ── Chips — horizontal scroll ─────────────────────────────────────────────
  chipsScroll: {
    // Bleed the scroll to card edges so chips can slide in from the padding area
    marginHorizontal: -CAT_CARD_PAD,
  },
  chipsScrollContent: {
    paddingHorizontal: CAT_CARD_PAD,
    gap: spacing['2xs'],
    alignItems: 'center',
  },
  chip: {
    width: CHIP_W,
    height: CHIP_H,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexShrink: 0,
  },
  chipAvailable: {
    backgroundColor: dark.bgAccent,
    ...glow.gold.xs,
  },
  chipAnswered: {
    backgroundColor: alpha.white[8],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: alpha.white[16],
  },
  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  chipPoints: {
    ...textStyle.titleSectionMd,
    fontWeight: '800',
  },
  chipUnit: {
    ...textStyle.labelSm,
    fontWeight: '500',
  },

  // ── Fixed header ─────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 16,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: alpha.white[8],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerEyebrow: {
    color: dark.textAccent,
    ...textStyle.labelSm,
    textAlign: 'center',
  },
  headerTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  closeBtnBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white[8],
  },

  // ── Active team pill (bottom bar) ─────────────────────────────────────────
  // Layout in RTL: [avatar RIGHT] [meta MIDDLE flex:1] [count LEFT]
  activeTeamPill: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  activeTeamPillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  // Avatar — first child = rightmost in RTL
  pillAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  pillAvatarEmoji: {
    fontSize: 18,
  },
  // Name + subtitle — flex 1, fills middle space
  pillMeta: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-start',
  },
  pillName: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '700',
    textAlign: 'auto',
  },
  pillSub: {
    color: dark.textSecondary,
    ...textStyle.labelSm,
    textAlign: 'auto',
  },
  // Remaining count — last child = leftmost in RTL
  pillRemaining: {
    ...textStyle.bodyXs,
    flexShrink: 0,
  },

  // ── Exit modal ───────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: dark.bgOverlay,
  },
  modalCard: {
    backgroundColor: dark.bgCard,
    borderRadius: radius['2xl'],
    padding: 22,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  modalTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionLg,
    fontWeight: '800',
  },
  modalBody: {
    color: dark.textSecondary,
    ...textStyle.bodyPrimary,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  confirmBtn: { flex: 1 },
  cancelBtn: {
    flex: 1,
    backgroundColor: dark.bgGlassStrong,
    borderWidth: 1,
    borderColor: dark.borderDefault,
  },
});
