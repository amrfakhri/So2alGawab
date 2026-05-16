import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Cast } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '../../../shared/components/AppIcon';
import { alpha, dark, palette, radius, spacing, textStyle } from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';

interface GameHeaderProps {
  /** e.g. "7/12" */
  roundLabel: string;
  /** Label shown in the cast pill. Always required — pass active or inactive string. */
  castLabel: string;
  /** True when a TV session is live — shows green dot and disables tap. */
  isCastActive: boolean;
  onClose: () => void;
  /** Called when the pill is tapped while not casting. */
  onPressCast?: () => void;
}

export function GameHeader({
  roundLabel,
  castLabel,
  isCastActive,
  onClose,
  onPressCast,
}: GameHeaderProps) {
  const insets = useSafeAreaInsets();
  const { rowLTR } = useLocale('game');

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.borderBottom} />

      <View style={[styles.row, { flexDirection: rowLTR }]}>
        {/* Round counter */}
        <Text style={styles.counter}>{roundLabel}</Text>

        {/* TV cast pill — always visible, tappable when inactive */}
        <Pressable
          onPress={isCastActive ? undefined : onPressCast}
          style={({ pressed }) => [
            styles.castPill,
            pressed && !isCastActive && styles.pressed,
          ]}
          hitSlop={6}
        >
          {/* Active: green dot indicator */}
          {isCastActive && (
            <View style={styles.castDot} />
          )}

          <Text style={styles.castText}>{castLabel}</Text>

          <Cast
            size={14}
            color={isCastActive ? palette.success[400] : dark.textSecondary}
            strokeWidth={2}
          />
        </Pressable>

        {/* Close button */}
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <LinearGradient
            colors={[alpha.white[8], alpha.white[4]]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.closeBorder} />
          <AppIcon name="close" size={18} color={dark.textSecondary} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: 16,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: alpha.white[8],
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  counter: {
    color: palette.neutral[100],
    ...textStyle.labelSm,
    fontWeight: '600',
    minWidth: 32,
  },
  castPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: alpha.white[8],
    borderWidth: 1,
    borderColor: alpha.white[16],
  },
  castDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.success[400],
  },
  castText: {
    color: dark.textSecondary,
    ...textStyle.captionSm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  closeBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: alpha.white[8],
  },
  pressed: { opacity: 0.75 },
});
