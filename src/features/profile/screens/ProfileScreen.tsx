import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User } from '@supabase/supabase-js';

import { AppStackParamList } from '../../../navigation/RootNavigator';
import { useLocale } from '../../../localization/useLocale';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useUserStore } from '../../home/store/useUserStore';
import { useUserStats } from '../../home/hooks/useUserStats';
import { ProfileAvatar } from '../../home/components/ProfileAvatar';
import { TabScreenHeader, HEADER_HEIGHT } from '../../../shared/components/TabScreenHeader';
import { AvatarPickerSheet } from '../../home/components/AvatarPickerSheet';
import { AppTabBar, AppTabBarWrapper, TAB_BAR_H, TAB_BAR_MARGIN } from '../../../shared/components/AppTabBar';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';
import {
  dark,
  gradients,
  r,
  spacing,
  textStyle,
  zIndex,
} from '../../../shared/theme/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────


// const HEADER_HEIGHT = 150;
const XP_PER_LEVEL  = 1000;

const AWARD_GRADIENT_START = { x: 0.7, y: 0 };
const AWARD_GRADIENT_END   = { x: 0.2, y: 1 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveFirstName(user: User | null, isGuest: boolean, guestLabel: string): string {
  if (isGuest) return guestLabel;
  if (!user) return '';
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const full = String(meta.username ?? meta.full_name ?? meta.name ?? '').trim();
  if (full) return full.split(/\s+/)[0] ?? full;
  if (user.email) return user.email.split('@')[0] ?? user.email;
  return '';
}

function formatPoints(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K`;
  return String(n);
}

function deriveLevel(totalPoints: number) {
  const level     = Math.floor(totalPoints / XP_PER_LEVEL) + 1;
  const currentXP = totalPoints % XP_PER_LEVEL;
  const progress  = currentXP / XP_PER_LEVEL;
  return { level, currentXP, maxXP: XP_PER_LEVEL, progress };
}

function getRankKey(level: number): string {
  if (level <= 2)  return 'beginner';
  if (level <= 5)  return 'player';
  if (level <= 9)  return 'senior';
  if (level <= 14) return 'pro';
  if (level <= 19) return 'expert';
  return 'champion';
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <LinearGradient
      colors={gradients.cardGlass}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCard}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

// ─── AwardCard ────────────────────────────────────────────────────────────────

type AwardColor = 'yellow' | 'red' | 'blue' | 'purple';

const AWARD_GRADIENTS: Record<AwardColor, readonly [string, string]> = {
  yellow: gradients.awardYellow,
  red:    gradients.awardRed,
  blue:   gradients.awardBlue,
  purple: gradients.awardPurple,
};

interface AwardCardProps {
  color: AwardColor;
  emoji: string;
  title: string;
  subtitle: string;
}

function AwardCard({ color, emoji, title, subtitle }: AwardCardProps) {
  return (
    <LinearGradient
      colors={AWARD_GRADIENTS[color]}
      start={AWARD_GRADIENT_START}
      end={AWARD_GRADIENT_END}
      style={styles.awardCard}
    >
      <View style={styles.awardIconBadge}>
        <Text style={styles.awardEmoji}>{emoji}</Text>
      </View>
      <View style={styles.awardTextBlock}>
        <Text style={styles.awardTitle} numberOfLines={2} textBreakStrategy="simple">
          {title}
        </Text>
        <Text style={styles.awardSubtitle}>{subtitle}</Text>
      </View>
    </LinearGradient>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { t, isRTL, textAlign } = useLocale('profile');
  const { t: tHome } = useLocale('home');
  const insets = useSafeAreaInsets();

  const { user, isGuest } = useAuthStore();
  const { avatarIndex, loadAvatar } = useUserStore();
  const stats = useUserStats();

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => { loadAvatar(); }, []);

  const displayName = deriveFirstName(user, isGuest, tHome('guest_name'));
  const { level, currentXP, maxXP, progress } = deriveLevel(stats.total_points);
  const rankKey   = getRankKey(level);
  const rankLabel = t(`rank.${rankKey}`);
  const winRate   = stats.games_played > 0
    ? Math.round((stats.wins / stats.games_played) * 100)
    : 0;
  const showVip   = stats.total_points >= 5000;

  const scrollBottomPad = insets.bottom + TAB_BAR_MARGIN + TAB_BAR_H + spacing.sm;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  function handleTabPress(tab: Parameters<typeof AppTabBar>[0]['activeTab']) {
    if (tab === 'home')        navigation.replace('Home');
    if (tab === 'play')        navigation.replace('Games');
    if (tab === 'leaderboard') navigation.replace('Ranks');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HEADER_HEIGHT }} />

        <View style={styles.body}>

          {/* ── Profile Card ─────────────────────────────────────────── */}
          <LinearGradient
            colors={gradients.cardGlass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <SpotlightFrame
              style={styles.profileSpotlight}
              opacity={1}
              gradientCy="-50%"
              gradientRy="200%"
            />

            {/* Top row: VIP badge + user info + avatar */}
            <View style={styles.profileTopRow}>
              {/* VIP badge */}
              {showVip && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipBadgeText}>{t('vip_badge')}</Text>
                  <Text style={styles.vipCrown}>👑</Text>
                </View>
              )}

              {/* User details (flex) + avatar */}
              <View style={styles.profileUserInfo}>
                <View style={styles.profileUserDetails}>
                  <Text style={[styles.profileName, { textAlign }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={[styles.profileRankLabel, { textAlign }]} numberOfLines={1}>
                    {rankLabel}
                  </Text>
                </View>

                {/* Avatar + edit button */}
                <Pressable
                  onPress={() => setShowAvatarPicker(true)}
                  style={({ pressed }) => [styles.profileAvatarWrap, pressed && styles.pressed]}
                >
                  <ProfileAvatar index={avatarIndex} size={64} />
                  <View style={[styles.profileEditBtn, isRTL ? styles.profileEditBtnRTL : styles.profileEditBtnLTR]}>
                    <Pencil size={12} color={dark.textInverse} strokeWidth={2.5} />
                  </View>
                </Pressable>
              </View>
            </View>

            {/* XP row + progress bar */}
            <View style={styles.xpSection}>
              <View style={styles.xpRow}>
                <Text style={styles.xpValue}>
                  {t('xp_label', { current: currentXP, max: maxXP })}
                </Text>
                <Text style={[styles.xpLevelLabel, { textAlign }]}>
                  {t('level_label', { level, rank: rankLabel })}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            </View>
          </LinearGradient>

          {/* ── Stats row ────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <StatCard value={formatPoints(stats.total_points)} label={t('stats.points')} />
            <StatCard value={`${winRate}%`}                    label={t('stats.win_rate')} />
            <StatCard value={String(stats.wins)}               label={t('stats.wins')} />
            <StatCard value={String(stats.games_played)}       label={t('stats.games')} />
          </View>

          {/* ── Achievements ─────────────────────────────────────────── */}
          <View style={styles.section}>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {t('achievements.title')}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.seeAllBtn, pressed && styles.pressed]}
                hitSlop={8}
              >
                <Text style={styles.seeAllText}>{t('achievements.see_all')}</Text>
                <ChevronIcon
                  size={14}
                  color={dark.textAccent}
                  strokeWidth={2.5}
                />
              </Pressable>
            </View>

            {/* Horizontal scroll of award cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.awardsScroll}
              contentContainerStyle={styles.awardsScrollContent}
            >
              <AwardCard
                color="yellow"
                emoji="🏆"
                title={t('awards.first_night_title')}
                subtitle={t('awards.first_night_time')}
              />
              <AwardCard
                color="red"
                emoji="🔥"
                title={t('awards.streak_title')}
                subtitle={t('awards.streak_time')}
              />
              <AwardCard
                color="blue"
                emoji="🎯"
                title={t('awards.sniper_title')}
                subtitle={t('awards.sniper_time')}
              />
              <AwardCard
                color="purple"
                emoji="👑"
                title={t('awards.king_title')}
                subtitle={t('awards.king_time')}
              />
            </ScrollView>
          </View>

        </View>
      </ScrollView>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <TabScreenHeader
        namespace="profile"
        title={t('')}
        subtitle={t('title')}
        showAvatar={false}
        showSettings
        showNotifications
      />

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <AppTabBarWrapper>
        <AppTabBar
          activeTab="profile"
          onTabPress={handleTabPress}
          labels={{
            home:        tHome('tabs.home'),
            play:        tHome('tabs.play'),
            leaderboard: tHome('tabs.leaderboard'),
            profile:     tHome('tabs.profile'),
          }}
        />
      </AppTabBarWrapper>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <AvatarPickerSheet
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Root / scroll ─────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing['2xs'],
  },
  pressed: { opacity: dark.opPressed },


  // ── Profile Card ──────────────────────────────────────────────────────────
  profileCard: {
    borderRadius: r.modal,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  profileSpotlight: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
    paddingHorizontal: spacing['2xs'],
    paddingVertical: 4,
    borderRadius: r.badge,
    borderWidth: 1,
    borderColor: dark.borderActive,
    backgroundColor: dark.bgAccentSubtle,
    flexShrink: 0,
  },
  vipBadgeText: {
    color: dark.textAccent,
    ...textStyle.labelSm,
    fontWeight: '700',
  },
  vipCrown: {
    fontSize: 11,
  },
  profileUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileUserDetails: {
    flex: 1,
    gap: spacing['3xs'],
  },
  profileName: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '800',
  },
  profileRankLabel: {
    color: dark.textAccent,
    ...textStyle.captionMd,
  },
  profileAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: r.card,
    overflow: 'visible',
    flexShrink: 0,
  },
  profileEditBtn: {
    position: 'absolute',
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: r.badge,
    backgroundColor: dark.bgAccent,
    borderWidth: 1.5,
    borderColor: dark.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEditBtnLTR: { left: -4 },
  profileEditBtnRTL: { right: -4 },

  // ── XP bar ────────────────────────────────────────────────────────────────
  xpSection: {
    gap: spacing['2xs'],
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpValue: {
    color: dark.textAccent,
    ...textStyle.overline,
    fontWeight: '700',
    flexShrink: 0,
  },
  xpLevelLabel: {
    flex: 1,
    color: dark.textTertiary,
    ...textStyle.captionSm,
  },
  progressTrack: {
    height: 8,
    borderRadius: r.badge,
    backgroundColor: dark.bgGlass,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: r.badge,
    backgroundColor: dark.bgAccent,
  },

  // ── Stats row ─────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    borderRadius: r.modal,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  statValue: {
    color: dark.textPrimary,
    ...textStyle.titleSectionMd,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    color: dark.textSecondary,
    ...textStyle.labelSm,
    textAlign: 'center',
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: { gap: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 24,
  },
  sectionTitle: {
    flex: 1,
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
    flexShrink: 0,
  },
  seeAllText: {
    color: dark.textAccent,
    ...textStyle.overline,
  },

  // ── Award cards ───────────────────────────────────────────────────────────
  awardsScroll: { marginHorizontal: -spacing.md },
  awardsScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  awardCard: {
    width: 140,
    borderRadius: r.modal,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing['xs'],
    overflow: 'hidden',
  },
  awardIconBadge: {
    width: 64,
    height: 64,
    borderRadius: r.card,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dark.bgGlass,
  },
  awardEmoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  awardTextBlock: {
    gap: spacing['3xs'],
    width: '100%',
  },
  awardTitle: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '800',
    textAlign: 'center',
  },
  awardSubtitle: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
    textAlign: 'center',
  },
});

