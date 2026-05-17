import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { dark, spacing, textStyle } from '../theme/tokens';
import { useLocale } from '../../localization/useLocale';

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  /** Override text alignment. Defaults to the locale's RTL-aware value. */
  textAlign?: 'left' | 'right' | 'center';
}

export function SheetHeader({ title, subtitle, textAlign: textAlignProp }: SheetHeaderProps) {
  const { textAlign: localeTextAlign } = useLocale();
  const align = textAlignProp ?? localeTextAlign;

  return (
    <View style={styles.block}>
      <Text style={[styles.title, { textAlign: align }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { textAlign: align }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
    gap: spacing['3xs'],
  },
  title: {
    color: dark.textPrimary,
    ...textStyle.titleSectionMd,
    fontWeight: '700',
    width:'100%'
  },
  subtitle: {
    color: dark.textTertiary,
    ...textStyle.labelMd,
    width:'100%'
  },
});
