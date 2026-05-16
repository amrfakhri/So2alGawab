import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { dark, gradients } from '../theme/tokens';

/**
 * Absolute-fill glass background for screen headers.
 * Renders BlurView (intensity=72, dark tint) + headerOverlay gradient + bottom border.
 * Place as the first child inside any header View that has overflow: 'hidden'.
 */
export function HeaderGlassBackground() {
  return (
    <BlurView tint="dark" intensity={72} style={styles.glass}>
      <LinearGradient
        colors={gradients.headerOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glass: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: dark.borderSubtle,
  },
});
