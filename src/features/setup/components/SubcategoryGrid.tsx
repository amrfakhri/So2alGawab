import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Category } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
import { MAX_SUBCATEGORIES_PER_MATCH, MIN_SUBCATEGORIES_PER_MATCH } from '../../../services/supabase/gameService';
import { SubcategoryCard } from './SubcategoryCard';
import { useLocale } from '../../../localization/useLocale';

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
  const { t } = useTranslation('setup');
  const { isRTL } = useLocale();
  const count = selectedSubcategoryIds.length;
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.title, { textAlign }]}>{t('subcategory_grid.title')}</Text>
        <Text style={styles.count}>{count} / {MAX_SUBCATEGORIES_PER_MATCH}</Text>
      </View>
      <Text style={[styles.hint, { textAlign }]}>
        {t('subcategory_grid.hint', { min: MIN_SUBCATEGORIES_PER_MATCH, max: MAX_SUBCATEGORIES_PER_MATCH })}
      </Text>

      {categories.map((category) => (
        <View key={category.id} style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{category.name}</Text>
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
    marginTop: -12,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
