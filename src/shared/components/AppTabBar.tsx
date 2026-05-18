import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from './AppIcon';
import {
  dark, gradients, glow, r, spacing, textStyle, zIndex,
} from '../theme/tokens';

export type TabKey = 'home' | 'play' | 'leaderboard' | 'profile';

const TAB_BAR_H    = 72;
const TAB_BAR_MARGIN = spacing.sm;

const TABS: { key: TabKey; icon: 'home-tab' | 'gamepad' | 'leaderboard' | 'profile' }[] = [
  { key: 'home',        icon: 'home-tab'    },
  { key: 'play',        icon: 'gamepad'     },
  { key: 'leaderboard', icon: 'leaderboard' },
  { key: 'profile',     icon: 'profile'     },
];

interface AppTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  labels: Record<TabKey, string>;
}

export function AppTabBar({ activeTab, onTabPress, labels }: AppTabBarProps) {
  return (
    <BlurView tint="dark" intensity={72} style={styles.pill}>
      {TABS.map(({ key, icon }) => {
        const active = key === activeTab;
        return (
          <Pressable key={key} onPress={() => onTabPress(key)} style={styles.item}>
            {active && (
              <LinearGradient
                colors={gradients.tabBarActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeBg}
              />
            )}
            <AppIcon
              name={icon}
              size={20}
              color={active ? dark.textAccent : dark.textSecondary}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {labels[key]}
            </Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

/** Wrapper that positions the tab bar pinned to the bottom, above safe area. */
export function AppTabBarWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + TAB_BAR_MARGIN }]}
      pointerEvents="box-none"
    >
      {children}
    </View>
  );
}

export { TAB_BAR_H, TAB_BAR_MARGIN };

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: zIndex.tabbar,
  },
  pill: {
    height: TAB_BAR_H,
    borderRadius: r.button,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: dark.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing['3xs'],
    ...glow.gold.xs,
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  item: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r.sheet,
    gap: spacing['3xs'],
    overflow: 'hidden',
  },
  activeBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: r.hero,
  },
  label: {
    color: dark.textSecondary,
    ...textStyle.labelSm,
    textAlign: 'center',
  },
  labelActive: {
    color: dark.textAccent,
  },
});
