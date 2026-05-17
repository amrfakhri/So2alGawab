import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { alpha, dark, gradients, glow, radius, textStyle } from '../../../shared/theme/tokens';

export type GameButtonVariant = 'primary' | 'success' | 'secondary' | 'error';

interface GameButtonProps {
  label: string;
  variant?: GameButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
  icon?: React.ReactNode;
}

export function GameButton({
  label,
  variant = 'primary',
  onPress,
  disabled,
  style,
  icon,
}: GameButtonProps) {
  const isPrimary   = variant === 'primary';
  const isSuccess   = variant === 'success';
  const isSecondary = variant === 'secondary';
  const isError     = variant === 'error';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        isPrimary  && glow.gold.sm,
        isSuccess  && glow.success.sm,
        isError    && glow.error.md,
        pressed    && styles.pressed,
        disabled   && styles.disabled,
        style,
      ]}
    >
      {isPrimary && (
        <LinearGradient
          colors={gradients.ctaGold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {isSuccess && (
        <LinearGradient
          colors={gradients.ctaSuccess}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {isSecondary && (
        <View style={[StyleSheet.absoluteFill, styles.secondaryBg]} />
      )}
      {isError && (
        <LinearGradient
          colors={gradients.ctaError}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.content}>
        {icon}
        <Text
          style={[
            styles.label,
            { color: isPrimary ? dark.textInverse : dark.textPrimary },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBg: {
    backgroundColor: alpha.white[8],
    borderWidth: 1,
    borderColor: alpha.white[12],
    borderRadius: radius.pill,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...textStyle.buttonMd,
    fontWeight: '800',
  },
  pressed:  { opacity: 0.8 },
  disabled: { opacity: 0.4 },
});
