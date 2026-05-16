import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MagnifyingGlassIcon } from 'phosphor-react-native';

import { Category } from '../../game/types/game';
import { SubcategoryCard } from './SubcategoryCard';
import { useLocale } from '../../../localization/useLocale';
import {
  CategorySearchField,
  FilterPill,
} from './CategorySelectionUI';
import { dark, spacing, textStyle } from '../../../shared/theme/tokens';

interface SubcategoryGridProps {
  categories: Category[];
  selectedSubcategoryIds: string[];
  onToggle: (subcategoryId: string) => void;
}

// 'all' or a category (list) ID
type FilterId = 'all' | string;

export function SubcategoryGrid({
  categories,
  selectedSubcategoryIds,
  onToggle,
}: SubcategoryGridProps) {
  const { t, isRTL, textAlign, rowLTR, needsRTLScrollFix } = useLocale('setup');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const filterScrollRef = useRef<ScrollView>(null);

  const scrollFiltersToStart = useCallback(() => {
    if (needsRTLScrollFix) filterScrollRef.current?.scrollToEnd({ animated: false });
  }, [needsRTLScrollFix]);

  const normalizedQuery = query.trim().toLowerCase();

  // Flatten all subcategories once
  const subcategories = useMemo(() => {
    return categories.flatMap((category) =>
      category.subcategories.map((sub) => ({ ...sub, description: category.name })),
    );
  }, [categories]);

  // Filter pills: "All" + one pill per list (category group)
  // In RTL, reverse so "All" ends up at max-x; scrollToEnd puts it in view first.
  const filters = useMemo<Array<{ id: FilterId; label: string }>>(() => {
    const base: Array<{ id: FilterId; label: string }> = [
      { id: 'all', label: t('subcategory_grid.filters.all') },
      ...categories.map((cat) => ({ id: cat.id, label: cat.name })),
    ];
    return needsRTLScrollFix ? [...base].reverse() : base;
  }, [categories, t, needsRTLScrollFix]);

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => {
      const matchesQuery =
        !normalizedQuery ||
        sub.name.toLowerCase().includes(normalizedQuery) ||
        sub.description.toLowerCase().includes(normalizedQuery);
      const matchesFilter = activeFilter === 'all' || sub.categoryId === activeFilter;
      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, normalizedQuery, subcategories]);

  const isEmpty = filteredSubcategories.length === 0;

  return (
    <View style={styles.wrapper}>
      <CategorySearchField
        value={query}
        onChangeText={setQuery}
        placeholder={t('subcategory_grid.search_placeholder')}
        inputRef={inputRef}
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        textAlign={textAlign}
        isRTL={isRTL}
      />

      <ScrollView
        ref={filterScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollFiltersToStart}
      >
        {filters.map((filter) => (
          <FilterPill
            key={filter.id}
            label={filter.label}
            selected={activeFilter === filter.id}
            onPress={() => setActiveFilter(filter.id)}
          />
        ))}
      </ScrollView>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <MagnifyingGlassIcon size={36} color={dark.borderDefault} weight="duotone" />
          <Text style={styles.emptyTitle}>{t('subcategory_grid.search_empty_title')}</Text>
          <Text style={styles.emptyBody}>{t('subcategory_grid.search_empty_body')}</Text>
        </View>
      ) : null}

      <View style={[styles.grid, { flexDirection: rowLTR }]}>
        {filteredSubcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory.id}
            subcategory={subcategory}
            remainingGames={subcategory.remainingQuestionCount}
            selected={selectedSubcategoryIds.includes(subcategory.id)}
            onPress={() => onToggle(subcategory.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  // Break out of parent's 24 px padding so pills scroll edge-to-edge
  filterScroll: {
    marginHorizontal: -spacing.md,
  },
  filters: {
    paddingHorizontal: spacing.md,
    gap: spacing['2xs'],
    paddingBottom: 2,
  },

  grid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 10,
  },
  emptyTitle: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: dark.textTertiary,
    ...textStyle.bodySm,
    lineHeight: 22,
    textAlign: 'center',
  },
});
