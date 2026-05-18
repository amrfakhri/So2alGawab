import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User } from '@supabase/supabase-js';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { useLocale } from '../../../localization/useLocale';
import { fetchGameCategories } from '../../../services/supabase/categoryService';
import {
  getCategoryBlobColor,
  getCategoryEmoji,
} from '../../setup/components/CategorySelectionUI';
import { AppIcon } from '../../../shared/components/AppIcon';
import { HeaderGlassBackground } from '../../../shared/components/HeaderGlassBackground';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';
import { CastToTvModal } from '../../tv/CastToTvModal';
import { LanguageSwitcher } from '../../settings/LanguageSwitcher';
import { AvatarPickerSheet } from '../components/AvatarPickerSheet';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useUserStats } from '../hooks/useUserStats';
import { Subcategory } from '../../game/types/game';
import {
  dark,
  gradients,
  glow,
  r,
  radius,
  spacing,
  textStyle,
  zIndex,
} from '../../../shared/theme/tokens';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatStatPoints(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K`;
  return String(n);
}

function deriveFirstName(user: User | null, isGuest: boolean, guestLabel: string): string {
  if (isGuest) return guestLabel;
  if (!user) return '';
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const full = String(meta.username ?? meta.full_name ?? meta.name ?? '').trim();
  if (full) return full.split(/\s+/)[0] ?? full;
  if (user.email) return user.email.split('@')[0] ?? user.email;
  return '';
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const HEADER_HEIGHT    = 150;
const TAB_BAR_H        = 72;
const TAB_BAR_MARGIN   = spacing.sm;   // 16 — margin above pill from screen bottom inset

// ─── CategoryPortraitCard ─────────────────────────────────────────────────────

interface PortraitCardProps {
  subcategory: Subcategory;
  questionLabel: string;
  onPress: () => void;
}

function CategoryPortraitCard({ subcategory, questionLabel, onPress }: PortraitCardProps) {
  const blobColor = getCategoryBlobColor(subcategory.id);
  const emoji     = getCategoryEmoji(subcategory.name);
  const hasImage  = !!subcategory.image;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <LinearGradient
        colors={gradients.cardGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.portraitCard}
      >
        <View style={styles.portraitImgContainer}>
          <View style={[styles.portraitImgBlob, { backgroundColor: blobColor }]} />
          {hasImage ? (
            <Image source={{ uri: subcategory.image }} style={styles.portraitImg} resizeMode="contain" />
          ) : (
            <Text style={styles.portraitEmoji}>{emoji}</Text>
          )}
        </View>
        <Text style={styles.portraitTitle} numberOfLines={2} textBreakStrategy="simple">
          {subcategory.name}
        </Text>
        <Text style={styles.portraitCount}>{questionLabel}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// ─── CategoryListCard ─────────────────────────────────────────────────────────

interface ListCardProps {
  subcategory: Subcategory;
  questionLabel: string;
  textAlign: 'right' | 'left';
  onPress: () => void;
}

function CategoryListCard({ subcategory, questionLabel, textAlign, onPress }: ListCardProps) {
  const blobColor = getCategoryBlobColor(subcategory.id);
  const emoji     = getCategoryEmoji(subcategory.name);
  const hasImage  = !!subcategory.image;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <LinearGradient
        colors={gradients.cardGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.listCard}
      >
        <View style={styles.listCardText}>
          <Text style={[styles.listCardTitle, { textAlign }]} numberOfLines={2} textBreakStrategy="simple">
            {subcategory.name}
          </Text>
          <Text style={[styles.listCardCount, { textAlign }]}>{questionLabel}</Text>
        </View>
        <View style={styles.listImgContainer}>
          <View style={[styles.listImgBlob, { backgroundColor: blobColor }]} />
          {hasImage ? (
            <Image source={{ uri: subcategory.image }} style={styles.listImg} resizeMode="contain" />
          ) : (
            <Text style={styles.listEmoji}>{emoji}</Text>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
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

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  seeAllLabel: string;
  isRTL: boolean;
  onSeeAll?: () => void;
}

function SectionHeader({ title, seeAllLabel, isRTL, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isRTL ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
        {title}
      </Text>
      <Pressable
        onPress={onSeeAll}
        style={({ pressed }) => [
          styles.seeAllBtn,
          isRTL ? styles.seeAllBtnRtl : styles.seeAllBtnLtr,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
      >
        <Text style={styles.seeAllText}>{seeAllLabel}</Text>
        <ChevronRight
          size={14}
          color={dark.textAccent}
          strokeWidth={2.5}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
      </Pressable>
    </View>
  );
}

// ─── HomeTabBar ───────────────────────────────────────────────────────────────

type TabKey = 'home' | 'play' | 'leaderboard' | 'profile';

interface TabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  labels: Record<TabKey, string>;
}

function HomeTabBar({ activeTab, onTabPress, labels }: TabBarProps) {

  const tabs: {
    key: TabKey;
    icon: 'home-tab' | 'gamepad' | 'leaderboard' | 'profile';
  }[] = [
    { key: 'home', icon: 'home-tab' },
    { key: 'play', icon: 'gamepad' },
    { key: 'leaderboard', icon: 'leaderboard' },
    { key: 'profile', icon: 'profile' },
  ];

  return (
    <BlurView
      tint="dark"
      intensity={72}
      style={styles.tabBarPill}
    >
      {tabs.map(({ key, icon }) => {
        const active = key === activeTab;

        return (
          <Pressable
            key={key}
            onPress={() => onTabPress(key)}
            style={styles.tabItem}
          >
            {active && (
              <LinearGradient
                colors={gradients.tabBarActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabActiveBackground}
              />
            )}

            <AppIcon
              name={icon}
              size={20}
              color={active ? dark.textAccent : dark.textSecondary}
            />

            <Text
              style={[
                styles.tabLabel,
                active && styles.tabLabelActive,
              ]}
            >
              {labels[key]}
            </Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}
// ─── HomeScreen ───────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { t, isRTL, textAlign } = useLocale('home');

  const insets        = useSafeAreaInsets();
  const [showCastModal, setShowCastModal]     = useState(false);
  const [showSettings, setShowSettings]       = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const { avatarIndex, loadAvatar } = useUserStore();
  useEffect(() => { loadAvatar(); }, []);

  const { user, isGuest } = useAuthStore();
  const displayName = deriveFirstName(user, isGuest, t('guest_name'));
  const userStats = useUserStats();

  const categoriesQuery = useQuery({
    queryKey: ['game-categories'],
    queryFn:  fetchGameCategories,
    staleTime: 5 * 60 * 1000,
  });

  const allSubs = useMemo(
    () => (categoriesQuery.data ?? []).flatMap((c) => c.subcategories),
    [categoriesQuery.data],
  );

  const mostPlayed = useMemo(
    () => [...allSubs].sort((a, b) => b.remainingQuestionCount - a.remainingQuestionCount).slice(0, 6),
    [allSubs],
  );

  const recommended = useMemo(() => {
    const mpIds = new Set(mostPlayed.map((s) => s.id));
    return allSubs.filter((s) => !mpIds.has(s.id)).slice(0, 4);
  }, [allSubs, mostPlayed]);

  const tabBarBottom    = insets.bottom + TAB_BAR_MARGIN;
  const scrollBottomPad = tabBarBottom + TAB_BAR_H + spacing.sm;

  function makeQuestionLabel(count: number) {
    return t('questions_count', { count });
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
          {/* ── Hero card ──────────────────────────────────────────────── */}
          <LinearGradient
            colors={gradients.cardGlass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Gold spotlight glow */}
            <SpotlightFrame style={styles.heroSpotlightWrap} opacity={0.6} />

            <Text style={[styles.heroEyebrow, isRTL ? styles.heroTextRtl : styles.heroTextLtr]}>
              {t('tonight')}
            </Text>

            <View style={styles.heroTitleBlock}>
              <Text style={[styles.heroTitle, isRTL ? styles.heroTextRtl : styles.heroTextLtr]}>
                {t('hero_title_1')}
              </Text>
              <Text style={[styles.heroTitle, isRTL ? styles.heroTextRtl : styles.heroTextLtr]}>
                {t('hero_title_2')}
              </Text>
            </View>

            <Text style={[styles.heroSubtitle, isRTL ? styles.heroTextRtl : styles.heroTextLtr]}>
              {t('hero_subtitle')}
            </Text>

            {/* CTA row */}
            <View
              style={styles.heroCtas}
            >
              {/* Primary: Play */}
              <Pressable
                style={({ pressed }) => [styles.heroCtaFlex, pressed && styles.pressed]}
                onPress={() => navigation.navigate('GameSetup')}
              >
                <LinearGradient
                  colors={gradients.cardGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroPlayBtn}
                >
                  <AppIcon name="gamepad" size={18} color={dark.iconInverse} weight="fill" />
                  <Text style={[styles.heroPlayBtnText, { textAlign: 'center' }]}>{t('play_btn')}</Text>
                </LinearGradient>
              </Pressable>

              {/* Secondary: Cast to TV */}
              <Pressable
                style={({ pressed }) => [styles.heroCtaFlex, pressed && styles.pressed]}
                onPress={() => setShowCastModal(true)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroTvBtn}
                >
                  <AppIcon name="cast-tv" size={18} color={dark.textPrimary} />
                  <Text style={[styles.heroTvBtnText, { textAlign: 'center' }]}>{t('tv_btn')}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>

          {/* ── Stats row (logged-in users only) ───────────────────── */}
          {!isGuest && (
            <View style={styles.statsRow}>
              {([
                    { value: formatStatPoints(userStats.total_points), key: 'points', label: t('stats.points') },
                    { value: String(userStats.wins),                   key: 'wins',   label: t('stats.wins')   },
                    { value: String(userStats.games_played),           key: 'games',  label: t('stats.games')  },
                  ]
              ).map((s) => (
                <StatCard key={s.key} value={s.value} label={s.label} />
              ))}
            </View>
          )}

          {/* ── Most Played ────────────────────────────────────────────── */}
          {(categoriesQuery.isPending || mostPlayed.length > 0) && (
            <View style={styles.section}>
              <SectionHeader
                title={t('most_played.title')}
                seeAllLabel={t('most_played.see_all')}
                isRTL={isRTL}
              />
              {categoriesQuery.isPending ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={dark.textAccent} />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.hScroll}
                  contentContainerStyle={styles.hScrollContent}
                >
                  {mostPlayed.map((sub) => (
                    <CategoryPortraitCard
                      key={sub.id}
                      subcategory={sub}
                      questionLabel={makeQuestionLabel(sub.remainingQuestionCount)}
                      onPress={() => navigation.navigate('GameSetup')}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* ── Recommended ────────────────────────────────────────────── */}
          {!categoriesQuery.isPending && recommended.length >= 2 && (
            <View style={styles.section}>
              <SectionHeader
                title={t('recommended.title')}
                seeAllLabel={t('recommended.see_all')}
                isRTL={isRTL}
              />
              <View style={styles.recommendedGrid}>
                <View style={styles.recommendedCol}>
                  {recommended[0] && (
                    <CategoryListCard
                      subcategory={recommended[0]}
                      questionLabel={makeQuestionLabel(recommended[0].remainingQuestionCount)}
                      textAlign={textAlign}
                      onPress={() => navigation.navigate('GameSetup')}
                    />
                  )}
                  {recommended[2] && (
                    <CategoryListCard
                      subcategory={recommended[2]}
                      questionLabel={makeQuestionLabel(recommended[2].remainingQuestionCount)}
                      textAlign={textAlign}
                      onPress={() => navigation.navigate('GameSetup')}
                    />
                  )}
                </View>
                <View style={styles.recommendedCol}>
                  {recommended[1] && (
                    <CategoryListCard
                      subcategory={recommended[1]}
                      questionLabel={makeQuestionLabel(recommended[1].remainingQuestionCount)}
                      textAlign={textAlign}
                      onPress={() => navigation.navigate('GameSetup')}
                    />
                  )}
                  {recommended[3] && (
                    <CategoryListCard
                      subcategory={recommended[3]}
                      questionLabel={makeQuestionLabel(recommended[3].remainingQuestionCount)}
                      textAlign={textAlign}
                      onPress={() => navigation.navigate('GameSetup')}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Header overlay (absolute) ────────────────────────────────────── */}
      <View
        style={[styles.header, { paddingTop: insets.top + spacing['2xs'] + 4 }]}
        pointerEvents="box-none"
      >
        <BlurView tint="dark" intensity={72} style={styles.headerGlass}>
          <LinearGradient
            colors={gradients.headerOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </BlurView>

        <View style={styles.headerRow}>
          {/* Avatar — tap to open picker */}
          <Pressable
            onPress={() => setShowAvatarPicker(true)}
            style={({ pressed }) => [pressed && styles.pressed]}
            hitSlop={4}
          >
            <ProfileAvatar index={avatarIndex} size={48} />
          </Pressable>

          {/* Greeting */}
          <View style={styles.headerTextBlock}>
            <Text style={[styles.headerGreeting, isRTL ? styles.headerTextRtl : styles.headerTextLtr]}>
              {t('greeting')}
            </Text>
            <Text style={[styles.headerName, isRTL ? styles.headerTextRtl : styles.headerTextLtr]}>
              {t('welcome', { name: displayName })}
            </Text>
          </View>

          {/* Icon buttons */}
          <View style={styles.headerIcons}>
            {/* Bell + badge */}
            <View style={styles.headerIconBtn}>
              {/* <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFillObject}
              /> */}
              <AppIcon name="bell" size={20} color={dark.iconTertiary} />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>2</Text>
              </View>
            </View>

            {/* Globe */}
            <Pressable
              onPress={() => setShowSettings(true)}
              style={({ pressed }) => [pressed && styles.pressed]}
              hitSlop={4}
            >
              <View style={styles.headerIconBtn}>
                {/* <LinearGradient
                  colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                  style={StyleSheet.absoluteFillObject}
                /> */}
                <AppIcon name="globe" size={20} color={dark.iconTertiary} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <View style={[styles.tabBarWrapper, { bottom: tabBarBottom }]} pointerEvents="box-none">
        <HomeTabBar
          activeTab="home"
          onTabPress={(tab) => { if (tab === 'play') navigation.navigate('GameSetup'); }}
          labels={{
            home:        t('tabs.home'),
            play:        t('tabs.play'),
            leaderboard: t('tabs.leaderboard'),
            profile:     t('tabs.profile'),
          }}
        />
      </View>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <CastToTvModal visible={showCastModal} onClose={() => setShowCastModal(false)} />
      <LanguageSwitcher visible={showSettings} onClose={() => setShowSettings(false)} />
      <AvatarPickerSheet visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Root / scroll ────────────────────────────────────────────────────────────
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

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: HEADER_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md - 4, // 20
    justifyContent: 'flex-end',
    zIndex: zIndex.appbar,
  },
  headerGlass: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: dark.borderSubtle,
  },
  headerGlassHighlight: {
    position: 'absolute',
    top: -20, left: -40, right: -40,
    height: 120,
    borderBottomLeftRadius: radius['4xl'],
    borderBottomRightRadius: radius['4xl'],
    opacity: 0.9,
  },
  headerGlassBottomFade: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: r.avatar,
    overflow: 'hidden',
    flexShrink: 0,
  },
  headerTextBlock: {
    flex: 1,
    gap: 2,
  },
  headerGreeting: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
  },
  headerName: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '800',
  },
  headerTextLtr: {
    textAlign: 'left',
  },
  headerTextRtl: {
    textAlign: 'left',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexShrink: 0,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: r.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    borderWidth: 1,
    borderColor: dark.borderDefault,
    backgroundColor: dark.bgGlassSubtle,
  },
  notifBadge: {
    position: 'absolute',
    top: -4, right: -4,
    zIndex: zIndex.raised,
    width: 18,
    height: 18,
    paddingHorizontal: spacing['3xs'],
    borderRadius: r.badge,
    backgroundColor: dark.statusError,
    borderWidth: 2,
    borderColor: dark.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: dark.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },

  // ── Hero card ─────────────────────────────────────────────────────────────────
  heroCard: {
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  heroSpotlightWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  heroEyebrow: {
    color: dark.textAccentMuted,
    ...textStyle.labelSm,
    fontWeight: '600',
  },
  heroTitleBlock: {
    gap: 0,
  },
  heroTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionLg,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: dark.textSecondary,
    ...textStyle.captionMd,
  },
  heroTextLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  heroTextRtl: {
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  heroCtas: {
    gap: spacing.xs,
    marginTop: spacing['3xs'],
  },
  heroCtaFlex: { flex: 1 },
  heroPlayBtn: {
    height: 48,
    borderRadius: r.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.sm,
    ...glow.gold.sm,
  },
  heroPlayBtnText: {
    color: dark.textInverse,
    ...textStyle.buttonSm,
    fontWeight: '800',
  },
  heroTvBtn: {
    height: 48,
    borderRadius: r.button,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.sm,
  },
  heroTvBtnText: {
    color: dark.textPrimary,
    ...textStyle.buttonSm,
    fontWeight: '700',
  },

  // ── Stats ─────────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    paddingVertical: spacing.md - 4, // 20
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

  // ── Section ───────────────────────────────────────────────────────────────────
  section: { gap: 14 },
  sectionHeader: {
    width: '100%',
    minHeight: 24,
    justifyContent: 'center',
  },
  sectionTitle: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '800',
    width: '100%',
  },
  sectionTitleLtr: {
    textAlign: 'left',
    paddingRight: 96,
  },
  sectionTitleRtl: {
    textAlign: 'left',
    paddingRight: 96,
  },
  seeAllBtn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  seeAllBtnLtr: {
    right: 0,
  },
  seeAllBtnRtl: {
    right: 0,
  },
  seeAllText: {
    color: dark.textAccent,
    ...textStyle.overline,
  },
  loadingRow: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Portrait cards ────────────────────────────────────────────────────────────
  hScroll: { marginHorizontal: -spacing.md },
  hScrollContent: { paddingHorizontal: spacing.md, gap: 14 },
  portraitCard: {
    width: 160,
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing['2xs'],
    overflow: 'hidden',
  },
  portraitImgContainer: {
    width: 75,
    height: 60,
    borderRadius: r.input,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  portraitImgBlob: {
    position: 'absolute',
    top: 0, bottom: 0, left: 8, right: 8,
    borderRadius: r.button,
  },
  portraitImg: { width: '100%', height: '100%' },
  portraitEmoji: { fontSize: 28, textAlign: 'center', zIndex: 1 },
  portraitTitle: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '800',
    textAlign: 'center',
  },
  portraitCount: {
    color: dark.textSecondary,  // rgba(255,255,255,0.45) — using closest token
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── List cards ────────────────────────────────────────────────────────────────
  recommendedGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  recommendedCol:  { flex: 1, gap: 14 },
  listCard: {
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: spacing.md - 4, // 20
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    overflow: 'hidden',
  },
  listCardText: { flex: 1, gap: spacing['3xs'] },
  listCardTitle: {
    color: dark.textPrimary,
    ...textStyle.labelMd,
    fontWeight: '700',
  },
  listCardCount: {
    color: dark.textSecondary,
    ...textStyle.captionSm,
    // opacity: dark.opMuted,
  },
  listImgContainer: {
    width: 48,
    height: 40,
    borderRadius: radius.sm + 2, // 10
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  listImgBlob: {
    position: 'absolute',
    top: 0, bottom: 0, left: 4, right: 4,
    borderRadius: r.button,
  },
  listImg:   { width: '100%', height: '100%' },
  listEmoji: { fontSize: 20, textAlign: 'center', zIndex: 1 },

  // ── Tab bar ───────────────────────────────────────────────────────────────────
  tabBarWrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: zIndex.tabbar,
  },
  tabBarPill: {
    height: TAB_BAR_H,
    borderRadius: r.button,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: dark.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing['3xs'],
    ...glow.gold.xs,
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r.sheet,
    gap: spacing['3xs'],
    overflow: 'hidden',
  },
  tabActiveBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: r.hero,
  },
  tabLabel: {
    color: dark.textSecondary,
    ...textStyle.labelSm,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: dark.textAccent,
  },
});
