import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MagnifyingGlassIcon } from 'phosphor-react-native';

import { Category } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
import { MAX_SUBCATEGORIES_PER_MATCH, MIN_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';
import { SubcategoryCard } from './SubcategoryCard';
import { useLocale } from '../../../localization/useLocale';
import { AppIcon } from '../../../shared/components/AppIcon';

interface SubcategoryGridProps {
  categories: Category[];
  selectedSubcategoryIds: string[];
  onToggle: (subcategoryId: string) => void;
}

export function SubcategoryGrid({
  categories,
  selectedSubcategoryIds,
  onToggle,
}: SubcategoryGridProps) {
  const { t, isRTL, textAlign, rowLTR } = useLocale('setup');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const count = selectedSubcategoryIds.length;

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo<Category[]>(() => {
    if (!normalizedQuery) return categories;

    return categories.reduce<Category[]>((acc, cat) => {
      if (cat.name.toLowerCase().includes(normalizedQuery)) {
        acc.push(cat);
        return acc;
      }
      const matchingSubs = cat.subcategories.filter((sub) =>
        sub.name.toLowerCase().includes(normalizedQuery),
      );
      if (matchingSubs.length > 0) {
        acc.push({ ...cat, subcategories: matchingSubs });
      }
      return acc;
    }, []);
  }, [categories, normalizedQuery]);

  const isSearchActive = normalizedQuery.length > 0;
  const isEmpty = isSearchActive && filteredCategories.length === 0;

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={[styles.header, { flexDirection: rowLTR }]}>
        <Text style={[styles.title, { textAlign }]}>{t('subcategory_grid.title')}</Text>
        <Text style={styles.count}>{count} / {MAX_SUBCATEGORIES_PER_MATCH}</Text>
      </View>
      <Text style={[styles.hint, { textAlign }]}>
        {t('subcategory_grid.hint', { min: MIN_SUBCATEGORIES_PER_MATCH, max: MAX_SUBCATEGORIES_PER_MATCH })}
      </Text>

      {/* ── Search field ── */}
      <Pressable
        style={[styles.searchRow, { flexDirection: rowLTR }, isFocused && styles.searchRowFocused]}
        onPress={() => inputRef.current?.focus()}
      >
        <MagnifyingGlassIcon
          size={18}
          color={isFocused ? colors.primary : colors.mutedText}
          weight="regular"
        />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { textAlign }]}
          value={query}
          onChangeText={setQuery}
          placeholder={t('subcategory_grid.search_placeholder')}
          placeholderTextColor={colors.mutedText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {isSearchActive ? (
          <Pressable
            onPress={() => { setQuery(''); inputRef.current?.focus(); }}
            hitSlop={10}
            style={styles.clearBtn}
          >
            <AppIcon name="close" size={14} color={colors.mutedText} weight="bold" />
          </Pressable>
        ) : null}
      </Pressable>

      {/* ── Empty search state ── */}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <MagnifyingGlassIcon size={36} color={colors.border} weight="duotone" />
          <Text style={styles.emptyTitle}>{t('subcategory_grid.search_empty_title')}</Text>
          <Text style={styles.emptyBody}>{t('subcategory_grid.search_empty_body')}</Text>
        </View>
      ) : null}

      {/* ── Category sections ── */}
      {filteredCategories.map((category) => (
        <View key={category.id} style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{category.name}</Text>
          <View style={[styles.grid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {category.subcategories.map((subcategory) => (
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  count: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  hint: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: -12,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchRowFocused: {
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '800',
  },
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
