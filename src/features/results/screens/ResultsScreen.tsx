import React from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Crown, Home, Share2 } from 'lucide-react-native';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { useGameStore } from '../../game/store/useGameStore';
import { useLocale } from '../../../localization/useLocale';
import { IconButton } from '../../../shared/components/IconButton';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';
import { HeaderGlassBackground } from '../../../shared/components/HeaderGlassBackground';
import {
  alpha, dark, glow, gradients, r, radius, spacing, textStyle,
} from '../../../shared/theme/tokens';
import { TeamId } from '../../game/types/game';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

// Team-specific visual config (A = gold, B = blue — matches game setup)
const TEAM_CONFIG: Record<TeamId, {
  gradient: readonly [string, string],
  avatarBg: string,
}> = {
  A: { gradient: gradients.ctaGold, avatarBg: dark.bgAccent },
  B: { gradient: gradients.cardBlue, avatarBg: dark.bgHighlight },
};

const HEADER_H = 60;

export function ResultsScreen({ navigation }: Props) {
  const { t, textAlign } = useLocale('game');
  const formatScore = (n: number) => n.toLocaleString('en-US');
  const insets = useSafeAreaInsets();

  const { teams, resetGame } = useGameStore();

  const sortedTeams = [teams.A, teams.B].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(teams.A.score, teams.B.score, 1);
  const isDraw = teams.A.score === teams.B.score;
  const winner = isDraw ? null : sortedTeams[0];

  const headerTotalH = insets.top + HEADER_H;
  const footerTotalH = insets.bottom + 56 + spacing.md + spacing.xl;

  async function handleShare() {
    try {
      const lines = sortedTeams.map((team, i) =>
        `${i + 1}. ${team.name}: ${formatScore(team.score)}`
      );
      await Share.share({ message: `${t('results.screen_title')}\n\n${lines.join('\n')}` });
    } catch {}
  }

  function handleGoHome() {
    resetGame();
    navigation.replace('Home');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={gradients.screen}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Gold spotlight at top */}
      <SpotlightFrame style={styles.spotlight} opacity={0.5} />

      {/* ── Scrollable content ─────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerTotalH + spacing.sm, paddingBottom: footerTotalH },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* WinnerTeamDetails */}
        <View style={styles.winnerSection}>

          {/* Badge pill */}
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              {isDraw ? t('results.draw_badge') : t('results.winner_badge')}
            </Text>
            {!isDraw && <Crown size={14} color={dark.textAccent} strokeWidth={2.5} />}
          </View>

          {/* Large winner avatar */}
          <View style={[
            styles.winnerAvatar,
            { backgroundColor: winner ? TEAM_CONFIG[winner.id].avatarBg : dark.bgAccent },
            glow.gold.md,
          ]}>
            <Text style={styles.winnerEmoji}>
              {(winner ?? sortedTeams[0]).avatar}
            </Text>
          </View>

          {/* Name + congrats */}
          <View style={styles.winnerTextBlock}>
            <Text style={[styles.winnerName, { textAlign: 'center' }]}>
              {isDraw ? t('results.draw_title') : winner?.name}
            </Text>
            <Text style={[styles.winnerCongrats, { textAlign: 'center' }]}>
              {isDraw ? t('results.draw_congrats') : t('results.winner_congrats')}
            </Text>
          </View>

          {/* Total points card (winner only) */}
          {!isDraw && winner && (
            <View style={styles.totalPointsCard}>
              <Text style={[styles.totalPointsLabel, { textAlign: 'center' }]}>
                {t('results.total_points_label')}
              </Text>
              <Text style={[styles.totalPointsScore, { textAlign: 'center' }]}>
                {formatScore(winner.score)}
              </Text>
            </View>
          )}
        </View>

        {/* TeamsListPoints */}
        <View style={styles.teamsList}>
          {sortedTeams.map((team, index) => {
            const { gradient, avatarBg } = TEAM_CONFIG[team.id];
            const barFill = team.score / maxScore;

            return (
              <View key={team.id} style={styles.teamRow}>
                {/* Rank badge — index 0 → rightmost in RTL (reading start) */}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>

                {/* Team avatar */}
                <View style={[styles.teamAvatar, { backgroundColor: avatarBg }]}>
                  <Text style={styles.teamAvatarEmoji}>{team.avatar}</Text>
                </View>

                {/* Name + QuestionsScoreBars (flex:1) */}
                <View style={styles.teamNameBar}>
                  <Text style={[styles.teamName, { textAlign }]} numberOfLines={1}>
                    {team.name}
                  </Text>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={gradient as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.barFill, { flex: barFill }]}
                    />
                    {barFill < 1 && <View style={{ flex: 1 - barFill }} />}
                  </View>
                </View>

                {/* Score — last in array → leftmost in RTL */}
                <Text style={styles.teamScore}>{formatScore(team.score)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Fixed header ───────────────────────────────────────── */}
      <View
        style={[styles.header, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <HeaderGlassBackground />

        {/* Array order: [home, title, share] → In RTL: home(RIGHT) | title | share(LEFT) */}
        <View style={styles.headerRow} pointerEvents="box-none">
          <IconButton icon={Home} onPress={handleGoHome} color={dark.iconPrimary} />
          <Text style={styles.headerTitle}>{t('results.screen_title')}</Text>
          <IconButton icon={Share2} onPress={handleShare} color={dark.iconPrimary} />
        </View>
      </View>

      {/* ── Fixed bottom panel ─────────────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <BlurView intensity={30} tint="dark" style={[StyleSheet.absoluteFill, styles.footerBg]} />

        <Pressable
          onPress={handleGoHome}
          style={({ pressed }) => [styles.homeBtn, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={gradients.ctaGold}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.homeBtnGradient}
          >
            <Text style={styles.homeBtnText}>{t('results.back_to_home')}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // ── Spotlight ──────────────────────────────────────────────
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 244,
  },

  // ── Scroll ────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
    alignItems: 'center',
  },

  // ── Winner section ────────────────────────────────────────
  winnerSection: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: dark.borderActive,
    backgroundColor: dark.bgGlass,
  },
  badgeText: {
    color: dark.textAccent,
    ...textStyle.labelMd,
  },
  winnerAvatar: {
    width: 112,
    height: 112,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  winnerEmoji: {
    fontSize: 56,
    lineHeight: 70,
  },
  winnerTextBlock: {
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  winnerName: {
    color: dark.textPrimary,
    ...textStyle.displayQuestion,
    fontWeight: '700',
    width: 300,
  },
  winnerCongrats: {
    color: dark.textAccent,
    ...textStyle.bodySm,
    width: 300,
  },
  totalPointsCard: {
    width: 200,
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderActiveMuted,
    backgroundColor: dark.bgAccentSubtle,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  totalPointsLabel: {
    color: dark.textAccent,
    ...textStyle.bodyXs,
    width: '100%',
  },
  totalPointsScore: {
    color: dark.textPrimary,
    ...textStyle.displayQuestion,
    fontWeight: '700',
    width: '100%',
  },

  // ── Teams list ────────────────────────────────────────────
  teamsList: {
    alignSelf: 'stretch',
    gap: 18,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    height: 64,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: alpha.white[4],
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    color: dark.textSecondary,
    ...textStyle.bodyPrimary,
    textAlign: 'center',
  },
  teamAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  teamAvatarEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  teamNameBar: {
    flex: 1,
    gap: spacing['3xs'],
    alignItems: 'flex-end',
    minWidth: 0,
  },
  teamName: {
    color: dark.textPrimary,
    ...textStyle.buttonSm,
    fontWeight: '700',
    width: '100%',
  },
  barTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: dark.bgGlass,
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    height: 6,
    borderRadius: radius.pill,
  },
  teamScore: {
    color: dark.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 0,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  headerRow: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  footerBg: {
    borderTopLeftRadius: r.sheet,
    borderTopRightRadius: r.sheet,
    overflow: 'hidden',
    backgroundColor: alpha.black[80],
  },
  homeBtn: {
    borderRadius: r.button,
    ...glow.gold.sm,
  },
  homeBtnGradient: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },

  pressed: { opacity: 0.72 },
});
