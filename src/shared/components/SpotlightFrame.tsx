import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface SpotlightFrameProps {
  /** Container style — set height to control spotlight size (default 244). */
  style?: StyleProp<ViewStyle>;
  /** Multiplies the stop opacities (default 1). Figma uses 0.5 on the game screen. */
  opacity?: number;
  /** Color variant: 'gold' (default) or 'error' (pink/red for team setup screen). */
  variant?: 'gold' | 'error';
}

/**
 * Radial spotlight — matches the Figma SpotlightFrame component.
 * 'gold' variant: warm gold glow (game screen).
 * 'error' variant: pink/red glow (team setup screen).
 */
export function SpotlightFrame({ style, opacity = 1, variant = 'gold' }: SpotlightFrameProps) {
  const color = variant === 'error' ? '#FF5C7A' : '#f6d366';
  const centerOpacity = variant === 'error' ? 0.3 * opacity : 0.35 * opacity;
  const gradientId = variant === 'error' ? 'errorSpot' : 'goldSpot';

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMin slice"
      >
        <Defs>
          <RadialGradient
            id={gradientId}
            cx="50%"
            cy="0%"
            rx="100%"
            ry="85%"
            fx="50%"
            fy="0%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0" stopColor={color} stopOpacity={centerOpacity} />
            <Stop offset="0.7" stopColor={color} stopOpacity={0} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
