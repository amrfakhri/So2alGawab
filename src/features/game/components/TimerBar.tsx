import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../shared/theme/colors';

interface TimerBarProps {
  remainingMs: number;
  durationMs: number;
}

export function TimerBar({ remainingMs, durationMs }: TimerBarProps) {
  const progress = Math.max(0, Math.min(1, remainingMs / durationMs));
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Time</Text>
        <Text style={styles.label}>{seconds}s</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.mutedText,
    fontWeight: '700',
  },
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#F0E4D6',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
