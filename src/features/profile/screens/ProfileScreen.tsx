import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';

import { AppStackParamList } from '../../../navigation/RootNavigator';
import { useLocale } from '../../../localization/useLocale';
import { AppTabBar, AppTabBarWrapper, TAB_BAR_H, TAB_BAR_MARGIN } from '../../../shared/components/AppTabBar';
import { ScreenEmptyState } from '../../../shared/components/ScreenEmptyState';
import { TabScreenHeader, HEADER_HEIGHT } from '../../../shared/components/TabScreenHeader';
import { dark, gradients, spacing } from '../../../shared/theme/tokens';

type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { t } = useLocale('profile');
  const { t: tHome } = useLocale('home');
  const insets = useSafeAreaInsets();

  function handleTabPress(tab: Parameters<typeof AppTabBar>[0]['activeTab']) {
    if (tab === 'home')        navigation.replace('Home');
    if (tab === 'play')        navigation.replace('Games');
    if (tab === 'leaderboard') navigation.replace('Ranks');
    if (tab === 'profile')     return; // already here
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
          icon={User}
          title={t('empty_title')}
          subtitle={t('empty_subtitle')}
        />
      </View>

      <TabScreenHeader />

      <AppTabBarWrapper>
        <AppTabBar
          activeTab="profile"
          onTabPress={handleTabPress}
          labels={{
            home:        tHome('tabs.home'),
            play:        tHome('tabs.play'),
            leaderboard: tHome('tabs.leaderboard'),
            profile:     tHome('tabs.profile'),
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
