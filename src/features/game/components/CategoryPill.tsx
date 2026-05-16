import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { alpha, dark, radius, textStyle } from '../../../shared/theme/tokens';

interface CategoryPillProps {
  categoryName: string;
  pointsLabel: string;
}

export function CategoryPill({ categoryName, pointsLabel }: CategoryPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.points}>{pointsLabel}</Text>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.category} numberOfLines={1}>{categoryName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: alpha.white[8],
    borderWidth: 1,
    borderColor: alpha.white[8],
  },
  points: {
    color: dark.textSecondary,
    ...textStyle.overline,
    fontWeight: '700',
  },
  dot: {
    color: dark.textTertiary,
    fontSize: 16,
    opacity: 0.5,
    lineHeight: 18,
  },
  category: {
    color: dark.textAccentMuted,
    ...textStyle.overline,
    fontWeight: '700',
    flexShrink: 1,
  },
});
