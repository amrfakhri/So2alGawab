import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Category } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
import { MAX_SUBCATEGORIES_PER_MATCH, MIN_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';
import { SubcategoryCard } from './SubcategoryCard';

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
  const count = selectedSubcategoryIds.length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>اختر الفئات</Text>
        <Text style={styles.count}>{count} / {MAX_SUBCATEGORIES_PER_MATCH}</Text>
      </View>
      <Text style={styles.hint}>
        اختر من {MIN_SUBCATEGORIES_PER_MATCH} إلى {MAX_SUBCATEGORIES_PER_MATCH} فئات
      </Text>

      {categories.map((category) => (
        <View key={category.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{category.name}</Text>
          <View style={styles.grid}>
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
    flexDirection: 'row',
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
    textAlign: 'right',
    marginTop: -12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
