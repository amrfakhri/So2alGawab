import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { GameBackdrop } from '../components/GameBackdrop';
import { useGameStore } from '../store/useGameStore';
import { useLocale } from '../../../localization/useLocale';
import {
  alpha,
  dark,
  glow,
  gradients,
  radius,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Countdown'>;

const STEPS = ['3', '2', '1', 'start'] as const;
const STEP_DURATION = 900;

export function CountdownScreen({ navigation, route }: Props) {
  const { gameMode } = route.params;
  const { t, textAlign } = useLocale('game');
  const insets = useSafeAreaInsets();
  const { teams } = useGameStore();

  const [stepIndex, setStepIndex] = useState(0);
  const scale = useRef(new Animated.Value(1.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: STEP_DURATION * 0.6,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: STEP_DURATION * 0.3,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.6,
            duration: STEP_DURATION * 0.3,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: STEP_DURATION * 0.3,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          scale.setValue(1.8);
          opacity.setValue(0);
          setStepIndex((i) => i + 1);
        });
      } else {
        navigation.replace(gameMode === 'selection' ? 'SelectionBoard' : 'Question');
      }
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  const currentStep = STEPS[stepIndex] ?? 'start';
  const isStart = currentStep === 'start';
  const stepLabel = isStart ? t('countdown.start') : currentStep;

  const teamA = teams.A;
  const teamB = teams.B;

  return (
    <>
      <StatusBar style="light" />
      <GameBackdrop>
        {/* Fixed header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.headerBorder} />
          <Text style={styles.headerText}>{t('countdown.header')}</Text>
        </View>

        {/* Main content — vertically centered */}
        <View style={styles.content}>
          {/* Countdown container: circle + labels */}
          <View style={styles.countdownContainer}>
            {/* Animated gold circle */}
            <Animated.View style={[styles.circleWrap, { transform: [{ scale }], opacity }]}>
              <LinearGradient
                colors={gradients.ctaGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.circle}
              >
                <Text
                  style={styles.circleText}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {stepLabel}
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Text below circle */}
            <View style={styles.labelBlock}>
              <Text style={styles.readyTitle}>{t('countdown.ready')}</Text>
              <Text style={styles.readySub}>{t('countdown.ready_sub')}</Text>
            </View>
          </View>

          {/* Teams section */}
          <View style={styles.teamsContainer}>
            {/* Team A — gold */}
            <View style={styles.teamCardA}>
              <LinearGradient
                colors={gradients.cardGoldSoft}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.teamCardBorderA} />
              <View style={styles.teamRow}>
                <View style={[styles.avatar, { backgroundColor: dark.bgAccent }]}>
                  <Text style={styles.avatarEmoji}>{teamA.avatar}</Text>
                </View>
                <Text style={[styles.teamName, { textAlign }]} numberOfLines={1}>
                  {teamA.name}
                </Text>
              </View>
            </View>

            {/* VS separator */}
            <View style={styles.vsRow}>
              <View style={styles.vsDivider} />
              <View style={styles.vsCircle}>
                <LinearGradient
                  colors={['#3d2a1a', '#0a0d1f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.vsCircleBorder} />
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.vsDivider} />
            </View>

            {/* Team B — blue */}
            <View style={styles.teamCardB}>
              <LinearGradient
                colors={gradients.cardBlueSoft}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.teamCardBorderB} />
              <View style={styles.teamRow}>
                {/* Avatar first = rightmost in RTL */}
                <View style={[styles.avatar, { backgroundColor: dark.bgHighlight }]}>
                  <Text style={styles.avatarEmoji}>{teamB.avatar}</Text>
                </View>
                <Text style={[styles.teamName, { textAlign }]} numberOfLines={1}>
                  {teamB.name}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </GameBackdrop>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    zIndex: 10,
    minHeight: 88,
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: alpha.white[8],
  },
  headerText: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Main content ─────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing['3xl'],
    paddingTop: 80,
  },

  // ── Countdown container ───────────────────────────────────────────────────────
  countdownContainer: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  circleWrap: {
    // shadow applied here so it animates with the circle
    ...glow.gold.md,
    borderRadius: radius.pill,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
  },
  circleText: {
    color: dark.textInverse,
    fontSize: 80,
    fontWeight: '800',
    lineHeight: 80,
    letterSpacing: -2,
    textAlign: 'center',
  },
  labelBlock: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  readyTitle: {
    color: dark.textPrimary,
    ...textStyle.titlePage,
    fontWeight: '700',
    textAlign: 'center',
  },
  readySub: {
    color: dark.textSecondary,
    ...textStyle.bodySm,
    textAlign: 'center',
  },

  // ── Teams section ─────────────────────────────────────────────────────────────
  teamsContainer: {
    width: '100%',
    gap: spacing.sm,
  },

  // Team card base
  teamCardB: {
    borderRadius: radius.md,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  teamCardA: {
    borderRadius: radius.md,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  teamCardBorderB: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: dark.borderFocusRing,
  },
  teamCardBorderA: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: dark.borderActiveMuted,
  },
  teamRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  teamName: {
    color: dark.textPrimary,
    ...textStyle.buttonSm,
    fontWeight: '700',
    flexShrink: 1,
  },

  // ── VS separator ─────────────────────────────────────────────────────────────
  vsRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  vsDivider: {
    flex: 1,
    height: 1,
    backgroundColor: dark.bgGlass,
  },
  vsCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    ...glow.gold.xs,
  },
  vsCircleBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: dark.borderActiveMuted,
  },
  vsText: {
    color: dark.textAccent,
    ...textStyle.titleCard,
    fontWeight: '700',
  },
});
