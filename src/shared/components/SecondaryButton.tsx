import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { dark, gradients, radius, spacing, textStyle } from '../theme/tokens';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
}

export function SecondaryButton({
  label,
  onPress,
  icon: Icon,
  iconPosition = 'left',
  disabled,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [pressed && !disabled && styles.pressed, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradients.cardGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {Icon && iconPosition === 'left' && (
          <Icon size={20} color={dark.textPrimary} />
        )}
        <Text style={styles.label}>{label}</Text>
        {Icon && iconPosition === 'right' && (
          <Icon size={20} color={dark.textPrimary} />
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: 56,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.md,
  },
  label: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
