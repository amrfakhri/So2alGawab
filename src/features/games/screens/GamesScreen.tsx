import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Cast } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../../../navigation/RootNavigator';
import { useLocale } from '../../../localization/useLocale';
import { AppTabBar, AppTabBarWrapper, TAB_BAR_H, TAB_BAR_MARGIN } from '../../../shared/components/AppTabBar';
import { TabScreenHeader, HEADER_HEIGHT } from '../../../shared/components/TabScreenHeader';
import { AppIcon } from '../../../shared/components/AppIcon';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';
import { CastToTvModal } from '../../tv/CastToTvModal';
import {
  dark,
  gradients,
  glow,
  r,
  spacing,
  textStyle,
  zIndex,
} from '../../../shared/theme/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

// const HEADER_HEIGHT = 150;

const GAME_GRADIENT_START = { x: 0.7, y: 0 };
const GAME_GRADIENT_END   = { x: 0.2, y: 1 };

// ─── GameTypeCard ─────────────────────────────────────────────────────────────

interface GameTypeCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  colors: readonly [string, string];
  onPress?: () => void;
}

function GameTypeCard({ emoji, title, subtitle, badge, colors, onPress }: GameTypeCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.gameTypeCardWrap, pressed && styles.pressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={colors}
        start={GAME_GRADIENT_START}
        end={GAME_GRADIENT_END}
        style={styles.gameTypeCard}
      >
        {badge && (
          <View style={styles.gameTypeBadge}>
            <Text style={styles.gameTypeBadgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.gameTypeIconBadge}>
          <Text style={styles.gameTypeEmoji}>{emoji}</Text>
        </View>
        <View style={styles.gameTypeTextBlock}>
          <Text style={styles.gameTypeTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.gameTypeSubtitle} numberOfLines={2}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── GamesScreen ──────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AppStackParamList, 'Games'>;

export function GamesScreen({ navigation }: Props) {
  const { t, isRTL, textAlign } = useLocale('games');
  const { t: tHome } = useLocale('home');
  const insets = useSafeAreaInsets();

  const [showCastModal, setShowCastModal] = useState(false);

  const scrollBottomPad = insets.bottom + TAB_BAR_MARGIN + TAB_BAR_H + spacing.sm;

  function handleTabPress(tab: Parameters<typeof AppTabBar>[0]['activeTab']) {
    if (tab === 'home')        navigation.replace('Home');
    if (tab === 'play')        return;
    if (tab === 'leaderboard') navigation.replace('Ranks');
    if (tab === 'profile')     navigation.replace('Profile');
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

          {/* ── Games Main Card (hero) ───────────────────────────────── */}
          <LinearGradient
            colors={gradients.cardGlass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <SpotlightFrame
              style={StyleSheet.absoluteFillObject}
              opacity={1}
              gradientCy="-50%"
              gradientRy="200%"
            />

            {/* Eyebrow badge */}
            <View style={styles.eyebrowBadge}>
              <Text style={styles.eyebrowText}>{t('quick_game_badge')}</Text>
            </View>

            {/* Two-line title */}
            <View style={styles.mainCardTitleBlock}>
              <Text style={[styles.mainCardTitle, { textAlign }]} numberOfLines={1}>
                {t('quick_game_title_1')}
              </Text>
              <Text style={[styles.mainCardSubtitle, { textAlign }]} numberOfLines={1}>
                {t('quick_game_title_2')}
              </Text>
            </View>

            {/* Action row: Cast button + Play CTA */}
            <View style={styles.mainCardActions}>
              {/* Play CTA — gold gradient */}
              <Pressable
                style={({ pressed }) => [styles.playBtnWrap, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={gradients.ctaGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.playBtn, glow.gold.sm]}
                >
                  <AppIcon name="play" size={20} color={dark.textInverse} weight="fill" />
                  <Text style={styles.playBtnText}>{t('play_btn')}</Text>
                  
                </LinearGradient>
              </Pressable>

              {/* TV Cast glass pill */}
              <Pressable
                style={({ pressed }) => [styles.castBtn, pressed && styles.pressed]}
                onPress={() => setShowCastModal(true)}
              >
                <Cast size={24} color={dark.iconPrimary} strokeWidth={2} />
              </Pressable>
            </View>
          </LinearGradient>

          {/* ── Game Types section ───────────────────────────────────── */}
          <View style={styles.section}>



            {/* Two cards side by side */}
            <View style={styles.gameTypeRow}>
              <GameTypeCard
                emoji="🎯"
                title={t('classic.title')}
                subtitle={t('classic.subtitle')}
                badge={t('classic.badge')}
                colors={gradients.awardYellow}
              />
              <GameTypeCard
                emoji="⚔️"
                title={t('teams.title')}
                subtitle={t('teams.subtitle')}
                colors={gradients.awardRed}
              />
            </View>
          </View>

        </View>
      </ScrollView>


      {/* ── Header ──────────────────────────────────────────────────────── */}
      <TabScreenHeader
        namespace="games"
        title={t('screen_title')}
        subtitle={t('screen_subtitle')}
        showAvatar={false}
        showSettings
        showNotifications
      />

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <AppTabBarWrapper>
        <AppTabBar
          activeTab="play"
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
      <CastToTvModal
        visible={showCastModal}
        onClose={() => setShowCastModal(false)}
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


  // ── Main card ─────────────────────────────────────────────────────────────
  mainCard: {
    borderRadius: r.modal,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
    minHeight: 190,
    justifyContent: 'flex-end',
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['2xs'],
    paddingVertical: spacing['3xs'],
    borderRadius: r.badge,
    borderWidth: 1,
    borderColor: dark.borderActive,
    backgroundColor: dark.bgAccentSubtle,
  },
  eyebrowText: {
    color: dark.textAccent,
    ...textStyle.captionMd,
    fontWeight: '700',
  },
  mainCardTitleBlock: {
    flexDirection:'column',
    alignItems:'flex-start',
    gap: 2,
  },
  mainCardTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '800',
  },
  mainCardSubtitle: {
    color: dark.textSecondary,
    ...textStyle.captionMd,
  },
  mainCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  castBtn: {
    width: 48,
    height: 48,
    borderRadius: r.button,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  playBtnWrap: {
    flex: 1,
    borderRadius: r.button,
    overflow: 'hidden',
  },
  playBtn: {
    height: 48,
    borderRadius: r.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
  },
  playBtnText: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '600',
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

  // ── Game type cards ───────────────────────────────────────────────────────
  gameTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gameTypeCardWrap: {
    flex: 1,
  },
  gameTypeCard: {
    borderRadius: r.modal,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.sm,
    gap: spacing.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  gameTypeIconBadge: {
    width: 56,
    height: 56,
    borderRadius: r.card,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dark.bgGlass,
  },
  gameTypeEmoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  gameTypeTextBlock: {
    gap: spacing['3xs'],
  },
  gameTypeTitle: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '800',
  },
  gameTypeSubtitle: {
    color: dark.textSecondary,
    ...textStyle.captionMd,
  },
  gameTypeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    height: 24,
    paddingHorizontal: spacing['2xs'] + 1,
    paddingVertical: 5,
    borderRadius: r.badge,
    borderWidth: 1,
    borderColor: dark.borderStrong,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTypeBadgeText: {
    color: dark.textPrimary,
    ...textStyle.labelSm,
  },
});
