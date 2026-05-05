import React from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

import { Subcategory } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  remainingGames: number;
  selected: boolean;
  onPress: () => void;
}

const artworkByType = {
  image: '🖼️',
  text: '📝',
  mixed: '🎭',
};

export function SubcategoryCard({
  subcategory,
  remainingGames,
  selected,
  onPress,
}: SubcategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>باقي {remainingGames} لعبة</Text>
        {selected ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>

      <View style={styles.artPanel}>
        <Text style={styles.artEmoji}>{artworkByType[subcategory.type]}</Text>
        <Text style={styles.artLabel}>{subcategory.image.replace('.png', '')}</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{subcategory.name}</Text>
        <Text style={styles.description}>{subcategory.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFF3EC',
  },
  pressed: {
    opacity: 0.92,
  },
  badgeRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  checkmark: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 18,
  },
  artPanel: {
    borderRadius: 18,
    backgroundColor: '#F6E7DB',
    minHeight: 118,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  artEmoji: {
    fontSize: 32,
  },
  artLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  copy: {
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  description: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});
