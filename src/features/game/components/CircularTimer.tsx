import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import { dark, gradients, layout, palette, textStyle } from '../../../shared/theme/tokens';

interface CircularTimerProps {
  remainingMs: number;
  durationMs: number;
  unitLabel: string;
}

const STROKE = 5;
const RADIUS = (layout.timerSize - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularTimer({ remainingMs, durationMs, unitLabel }: CircularTimerProps) {
  const progress = Math.max(0, Math.min(1, remainingMs / Math.max(1, durationMs)));
  const seconds  = Math.ceil(remainingMs / 1000);
  const offset   = CIRCUMFERENCE * (1 - progress);

  const ringColor =
    progress > 0.5  ? dark.timerSafe
    : progress > 0.25 ? dark.timerCaution
    : dark.timerDanger;

  return (
    <View style={styles.wrap}>
      {/* Background gradient: #05070f → #13162a */}
      <LinearGradient
        colors={gradients.timer}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* SVG ring */}
      <Svg
        width={layout.timerSize}
        height={layout.timerSize}
        style={StyleSheet.absoluteFill}
      >
        {/* Track */}
        <Circle
          cx={layout.timerSize / 2}
          cy={layout.timerSize / 2}
          r={RADIUS}
          stroke={dark.borderDefault}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={layout.timerSize / 2}
          cy={layout.timerSize / 2}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE},${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${layout.timerSize / 2} ${layout.timerSize / 2})`}
        />
      </Svg>

      {/* Labels */}
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.value, { color: ringColor }]}>{seconds}</Text>
        <Text style={styles.unit}>{unitLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: layout.timerSize,
    height: layout.timerSize,
    borderRadius: layout.timerSize / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.neutral[800],
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...textStyle.titleSectionLg,
    fontWeight: '800',
    lineHeight: 26,
  },
  unit: {
    color: dark.textTertiary,
    ...textStyle.captionSm,
    marginTop: -4,
  },
});
