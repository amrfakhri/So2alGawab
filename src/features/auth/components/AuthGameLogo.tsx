import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { gradients, r, dark, textStyle } from '../../../shared/theme/tokens';

export function AuthGameLogo() {
  return (
    <LinearGradient
      colors={gradients.cardGlass}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.placeholder}>So2alGawab</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    borderRadius: r.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
    textAlign: 'center',
  },
});
