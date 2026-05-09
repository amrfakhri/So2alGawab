import React from 'react';
import {
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Category } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
import { AppIcon } from '../../../shared/components/AppIcon';

interface CategoryPickerProps {
  categories: Category[];
  selectedSubcategoryIds: string[];
  onToggle: (subcategoryId: string) => void;
}

export function CategoryPicker({
  categories,
  selectedSubcategoryIds,
  onToggle,
}: CategoryPickerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>اختر فئتين فرعيتين</Text>
        <Text style={styles.count}>{selectedSubcategoryIds.length}/2</Text>
      </View>

      {categories.map((category) => (
        <View key={category.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{category.name}</Text>
          <View style={styles.grid}>
            {category.subcategories.map((subcategory) => {
              const selected = selectedSubcategoryIds.includes(subcategory.id);

              return (
                <Pressable
                  key={subcategory.id}
                  onPress={() => onToggle(subcategory.id)}
                  style={[
                    styles.cardItem,
                    selected && styles.cardItemSelected,
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <AppIcon
                      name={selected ? 'check' : 'circle'}
                      size={18}
                      color={selected ? colors.primary : colors.border}
                      weight={selected ? 'bold' : 'regular'}
                    />
                    <Text style={styles.typeBadge}>{subcategory.type}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{subcategory.name}</Text>
                  <Text style={styles.cardDescription}>{subcategory.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 20,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  count: {
    color: colors.primary,
    fontWeight: '800',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: 17,
    fontWeight: '800',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  grid: {
    gap: 12,
  },
  cardItem: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    gap: 8,
  },
  cardItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0E8',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  cardDescription: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
