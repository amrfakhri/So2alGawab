import React from 'react';
import { StyleSheet, View } from 'react-native';

import { layout } from '../../../shared/theme/tokens';
import { TeamScoreChip, TeamAccent } from './TeamScoreChip';
import { CircularTimer } from './CircularTimer';

interface TeamMeta {
  name: string;
  score: number;
  statusLabel: string;
  emoji: string;
  accent: TeamAccent;
  isActive: boolean;
}

interface TeamsVSandTimerProps {
  /** Active team — renders on the leading side (right in RTL). */
  primary: TeamMeta;
  /** Waiting team — renders on the trailing side (left in RTL). */
  secondary: TeamMeta;
  remainingMs: number;
  durationMs: number;
  timerUnitLabel: string;
}

export function TeamsVSandTimer({
  primary,
  secondary,
  remainingMs,
  durationMs,
  timerUnitLabel,
}: TeamsVSandTimerProps) {
  return (
    <View style={styles.row}>
      <TeamScoreChip {...primary} />
      <TeamScoreChip {...secondary} />

      {/* Timer overlaid at centre */}
      <View style={styles.timerOverlay} pointerEvents="none">
        <CircularTimer
          remainingMs={remainingMs}
          durationMs={durationMs}
          unitLabel={timerUnitLabel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.timerSize - 14, // chips overlap inward so timer sits in the gap
  },
  timerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
