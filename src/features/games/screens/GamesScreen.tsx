import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gamepad2 } from 'lucide-react-native';

import { AppStackParamList } from '../../../navigation/RootNavigator';
import { useLocale } from '../../../localization/useLocale';
import { AppTabBar, AppTabBarWrapper, TAB_BAR_H, TAB_BAR_MARGIN } from '../../../shared/components/AppTabBar';
import { ScreenEmptyState } from '../../../shared/components/ScreenEmptyState';
import { TabScreenHeader, HEADER_HEIGHT } from '../../../shared/components/TabScreenHeader';
import { dark, gradients, spacing } from '../../../shared/theme/tokens';

type Props = NativeStackScreenProps<AppStackParamList, 'Games'>;

export function GamesScreen({ navigation }: Props) {
  const { t } = useLocale('games');
  const insets = useSafeAreaInsets();

  function handleTabPress(tab: Parameters<typeof AppTabBar>[0]['activeTab']) {
    if (tab === 'home')        navigation.replace('Home');
    if (tab === 'play')        return; // already on Games
    if (tab === 'leaderboard') navigation.replace('Ranks');
    if (tab === 'profile')     navigation.replace('Profile');
  }

  const topPad    = HEADER_HEIGHT;
  const bottomPad = insets.bottom + TAB_BAR_MARGIN + TAB_BAR_H + spacing.sm;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={gradients.screen}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <ScreenEmptyState
          icon={Gamepad2}
          title={t('empty_title')}
          subtitle={t('empty_subtitle')}
        />
      </View>

      <TabScreenHeader />

      <AppTabBarWrapper>
        <AppTabBar
          activeTab="play"
          onTabPress={handleTabPress}
          labels={{
            home:        t('tabs.home'),
            play:        t('tabs.play'),
            leaderboard: t('tabs.leaderboard'),
            profile:     t('tabs.profile'),
          }}
        />
      </AppTabBarWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
