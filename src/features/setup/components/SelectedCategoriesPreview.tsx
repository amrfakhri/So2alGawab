import React from 'react';
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Subcategory } from '../../game/types/game';
import { colors } from '../../../shared/theme/colors';
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon';

interface SelectedCategoriesPreviewProps {
  subcategories: Subcategory[];
  onRemove: (subcategoryId: string) => void;
}

const ICON_BY_TYPE: Record<string, AppIconName> = {
  image: 'image-type',
  text: 'text-type',
  mixed: 'mixed-type',
};

export function SelectedCategoriesPreview({
  subcategories,
  onRemove,
}: SelectedCategoriesPreviewProps) {
  if (subcategories.length === 0) return null;

  const isRTL = I18nManager.isRTL;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && styles.scrollContentRTL,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {subcategories.map((sub) => (
          <View key={sub.id} style={styles.chip}>
            {/* Icon */}
            <View style={styles.iconCircle}>
              <AppIcon
                name={ICON_BY_TYPE[sub.type] ?? 'mixed-type'}
                size={20}
                color={colors.primary}
                weight="duotone"
              />
            </View>

            {/* Name — bounded by the chip's fixed width, always visible */}
            <Text style={styles.chipName} numberOfLines={2}>
              {sub.name}
            </Text>

            {/* Remove button */}
            <Pressable
              onPress={() => onRemove(sub.id)}
              style={({ pressed }) => [
                styles.removeBtn,
                isRTL ? styles.removeBtnLeft : styles.removeBtnRight,
                pressed && styles.removeBtnPressed,
              ]}
              hitSlop={8}
            >
              <AppIcon name="close" size={9} color={colors.card} weight="bold" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const CHIP_WIDTH = 96;

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: 2,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  scrollContentRTL: {
    flexDirection: 'row-reverse',
  },

  // Vertical chip: fixed width so text always has a known constraint
  chip: {
    position: 'relative',
    width: CHIP_WIDTH,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 6,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // No flex:1 — chip has an explicit width, so the text is fully bounded
  chipName: {
    alignSelf: 'stretch',
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },

  removeBtn: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnRight: {
    right: -8,
  },
  removeBtnLeft: {
    left: -8,
  },
  removeBtnPressed: {
    opacity: 0.7,
  },
});
