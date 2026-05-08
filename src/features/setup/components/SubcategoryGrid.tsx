import React from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';

import { Category } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
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
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>اختر فئتين للعبة</Text>
        <Text style={styles.count}>{selectedSubcategoryIds.length}/2</Text>
      </View>

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
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
