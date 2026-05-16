import { AppleLogo } from 'phosphor-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, textStyle } from '../../../shared/theme/tokens';
import { GoogleIcon } from './GoogleIcon';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SocialButton({ provider, label, onPress, loading, disabled }: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (pressed || loading) && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000000" />
      ) : provider === 'google' ? (
        <GoogleIcon size={22} />
      ) : (
        <AppleLogo size={22} color="#000000" weight="fill" />
      )}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.sm,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    color: 'rgba(0,0,0,0.75)',
    ...textStyle.buttonMd,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
