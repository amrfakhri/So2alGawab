import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Subcategory } from '../../game/types/game';
import { useLocale } from '../../../localization/useLocale';
import { SelectedCategoryChip } from './CategorySelectionUI';
import { dark, spacing, textStyle } from '../../../shared/theme/tokens';

interface SelectedCategoriesPreviewProps {
  subcategories: Subcategory[];
  onRemove: (subcategoryId: string) => void;
  onClear?: () => void;
}

export function SelectedCategoriesPreview({
  subcategories,
  onRemove,
  onClear,
}: SelectedCategoriesPreviewProps) {
  const { t, isRTL } = useLocale('setup');

  if (subcategories.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, isRTL ? styles.titleRtl : styles.titleLtr]}>
          {t('selected_categories.title', { count: subcategories.length })}
        </Text>
        {onClear ? (
          <Pressable
            onPress={onClear}
            hitSlop={10}
            style={({ pressed }) => [
              styles.clearButton,
              isRTL ? styles.clearButtonRtl : styles.clearButtonLtr,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.clearText}>{t('selected_categories.clear')}</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {subcategories.map((sub) => (
          <SelectedCategoryChip
            key={sub.id}
            label={sub.name}
            onRemove={() => onRemove(sub.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  titleRow: {
    width: '100%',
    minHeight: 18,
    justifyContent: 'center',
  },
  title: {
    color: dark.textTertiary,
    ...textStyle.overline,
    fontWeight: '800',
    width: '100%',
  },
  titleLtr: {
    textAlign: 'left',
    paddingEnd: 96,
  },
  titleRtl: {
    textAlign: 'right',
    paddingEnd: 96,
  },
  clearButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    end: 0,
    justifyContent: 'center',
  },
  clearButtonLtr: {},
  clearButtonRtl: {},
  clearText: {
    color: dark.textAccent,
    ...textStyle.overline,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    minHeight: 36,
    gap: spacing['2xs'],
    alignItems: 'center',
  },
});
