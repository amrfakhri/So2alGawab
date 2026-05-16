import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { gradients } from '../../../shared/theme/tokens';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';

/**
 * Full-screen dark backdrop with the Figma radial screen gradient and the gold
 * spotlight at the top — use as the outermost wrapper of the Question screen.
 */
export function GameBackdrop({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      {/* Screen gradient: #1b1530 → #131021 → #0a0b12 (approximates Figma radial) */}
      <LinearGradient
        colors={gradients.screen}
        locations={[0, 0.275, 0.55]}
        style={StyleSheet.absoluteFill}
      />

      {/* Gold spotlight at top — opacity 0.5 as per Figma */}
      <SpotlightFrame style={styles.spotlight} opacity={0.5} />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0b12',
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 244,
    zIndex: 0,
  },
  content: {
    flex: 1,
  },
});
