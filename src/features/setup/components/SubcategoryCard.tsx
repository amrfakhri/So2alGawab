import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Subcategory } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon';

interface SubcategoryCardProps {
  subcategory: Subcategory;
  remainingGames: number;
  selected: boolean;
  onPress: () => void;
}

const artworkByType: Record<string, AppIconName> = {
  image: 'image-type',
  text: 'text-type',
  mixed: 'mixed-type',
};

export function SubcategoryCard({
  subcategory,
  remainingGames,
  selected,
  onPress,
}: SubcategoryCardProps) {
  const { t } = useTranslation('setup');

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
        <Text style={styles.badge}>
          {t('subcategory_card.remaining', { count: remainingGames })}
        </Text>
        {selected ? (
          <AppIcon name="check" size={18} color={colors.primary} weight="bold" />
        ) : null}
      </View>

      <View style={styles.artPanel}>
        <AppIcon
          name={artworkByType[subcategory.type] ?? 'mixed-type'}
          size={36}
          color={colors.primaryDark}
          weight="duotone"
        />
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
    flexDirection: 'row',
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
  artPanel: {
    borderRadius: 18,
    backgroundColor: '#F6E7DB',
    minHeight: 118,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
    textAlign: 'right',
  },
  description: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
});
