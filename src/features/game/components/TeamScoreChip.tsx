import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { alpha, dark, gradients, layout, palette, radius, textStyle } from '../../../shared/theme/tokens';

export type TeamAccent = 'gold' | 'blue';

interface TeamScoreChipProps {
  name: string;
  score: number;
  statusLabel: string;
  emoji: string;
  accent: TeamAccent;
  isActive: boolean;
}

export function TeamScoreChip({ name, score, statusLabel, emoji, accent, isActive }: TeamScoreChipProps) {

  const isBlue = accent === 'blue';

  const colors      = isActive
    ? (accent === 'gold' ? gradients.teamGold : gradients.teamBlue)
    : [dark.bgGlass, dark.bgGlass] as const;
  const borderColor = isActive
    ? (accent === 'gold' ? palette.gold[600] : palette.blue[300])
    : dark.borderDefault;
  const borderWidth = 0.5;
  const statusColor = isActive
    ? (accent === 'gold' ? dark.textAccent : palette.blue[400])
    : dark.textSecondary;
  const avatarBg = isActive
    ? (accent === 'gold' ? palette.gold[400] : palette.blue[400])
    : alpha.white[16];

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.border, { borderColor, borderWidth }]} />

      <View style={[styles.row, isBlue && styles.rowReverse]}>
        <View style={[styles.leftSide, isBlue && styles.leftSideReverse]}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>{emoji}</Text>
          </View>

          <View style={styles.textCol}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>

            <Text
              style={[styles.status, { color: statusColor }]}
              numberOfLines={1}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.score}>{score.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    height: layout.teamChipHeight,
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  score: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '700',
    flexShrink: 0,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  leftSideReverse: {
    flexDirection: 'row-reverse',
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    color: dark.textPrimary,
    ...textStyle.overline,
    fontWeight: '700',
    textAlign: 'auto',
  },
  status: {
    ...textStyle.captionSm,
  },
  avatar: {
    width: layout.avatarSize,
    height: layout.avatarSize,
    borderRadius: layout.avatarSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
