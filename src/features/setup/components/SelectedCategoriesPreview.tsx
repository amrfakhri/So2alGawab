import React, { useCallback, useRef } from 'react';
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
  const { t, textAlign, rowLTR, needsRTLScrollFix } = useLocale('setup');
  const scrollRef = useRef<ScrollView>(null);

  const scrollToStart = useCallback(() => {
    if (needsRTLScrollFix) scrollRef.current?.scrollToEnd({ animated: false });
  }, [needsRTLScrollFix]);

  const displayedSubs = needsRTLScrollFix ? [...subcategories].reverse() : subcategories;

  if (subcategories.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.titleRow, { flexDirection: rowLTR }]}>
        <Text style={[styles.title, { textAlign }]}>
          {t('selected_categories.title', { count: subcategories.length })}
        </Text>
        {onClear ? (
          <Pressable onPress={onClear} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.clearText}>{t('selected_categories.clear')}</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToStart}
      >
        {displayedSubs.map((sub) => (
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: dark.textTertiary,
    ...textStyle.overline,
    fontWeight: '800',
  },
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
