import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { dark, gradients, radius } from '../theme/tokens';

interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  color?: string;
  size?: number;
  hitSlop?: number;
}

export function IconButton({
  icon: Icon,
  onPress,
  color = dark.iconTertiary,
  size = 20,
  hitSlop = 10,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <LinearGradient
        colors={gradients.cardGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Icon size={size} color={color} />
      </LinearGradient>
    </Pressable>
  );
}

export function IconButtonPlaceholder() {
  return <View style={styles.placeholder} />;
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
