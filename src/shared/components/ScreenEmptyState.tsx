import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

import { dark, spacing, textStyle } from '../theme/tokens';

interface ScreenEmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export function ScreenEmptyState({ icon: Icon, title, subtitle }: ScreenEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={32} color={dark.textTertiary} strokeWidth={1.5} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing['2xs'],
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  title: {
    color: dark.textTertiary,
    ...textStyle.labelMd,
    textAlign: 'center',
  },
  subtitle: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
    textAlign: 'center',
  },
});
