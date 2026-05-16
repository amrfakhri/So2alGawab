import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';
import { SetupHeader, GoldPrimaryButton } from '../components/CategorySelectionUI';
import { TeamNameCard } from '../components/TeamNameCard';
import { AvatarSelectorSheet } from '../components/AvatarSelectorSheet';
import { GameModeSheet } from '../../game/components/GameModeSheet';
import { useGameStore } from '../../game/store/useGameStore';
import { TeamId, GameMode } from '../../game/types/game';
import { alpha, dark, gradients, glow, radius, spacing, textStyle } from '../../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamSetup'>;

export function TeamSetupScreen({ navigation }: Props) {
  const { t } = useTranslation('setup');
  const insets = useSafeAreaInsets();

  const {
    teams,
    isStartingMatch,
    matchError,
    setTeamName,
    setTeamAvatar,
    startMatch,
  } = useGameStore();

  const [avatarTarget, setAvatarTarget] = useState<TeamId | null>(null);
  const [showModeSheet, setShowModeSheet] = useState(false);

  const canStart =
    teams.A.name.trim().length > 0 && teams.B.name.trim().length > 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={gradients.screen}
        locations={[0, 0.275, 0.55]}
        style={StyleSheet.absoluteFill}
      />

      {/* Pink/error spotlight */}
      <SpotlightFrame
        variant="error"
        opacity={1}
        style={styles.spotlight}
      />

      {/* Header */}
      <SetupHeader
        title={t('team_setup.title')}
        subtitle={t('team_setup.subtitle')}
        onActionPress={() => {}}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />

      {/* Cards */}
      <View style={[styles.body, { paddingBottom: insets.bottom + 120 }]}>
        <TeamNameCard
          teamId="A"
          name={teams.A.name}
          avatar={teams.A.avatar}
          onChangeName={(v) => setTeamName('A', v)}
          onPressAvatar={() => setAvatarTarget('A')}
        />

        {/* VS separator */}
        <View style={styles.vsRow}>
          <View style={styles.vsDivider} />
          <View style={[styles.vsCircle, glow.gold.xs]}>
            <LinearGradient
              colors={gradients.questionCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.vsDivider} />
        </View>

        <TeamNameCard
          teamId="B"
          name={teams.B.name}
          avatar={teams.B.avatar}
          onChangeName={(v) => setTeamName('B', v)}
          onPressAvatar={() => setAvatarTarget('B')}
        />
      </View>

      {/* Fixed footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <GoldPrimaryButton
          label={t('team_setup.start_btn')}
          disabled={!canStart}
          onPress={() => setShowModeSheet(true)}
        />
      </View>

      {/* Avatar picker sheet */}
      {avatarTarget !== null && (
        <AvatarSelectorSheet
          visible={avatarTarget !== null}
          teamId={avatarTarget}
          currentAvatar={teams[avatarTarget].avatar}
          onSelect={(emoji) => setTeamAvatar(avatarTarget, emoji)}
          onClose={() => setAvatarTarget(null)}
        />
      )}

      {/* Game mode sheet */}
      <GameModeSheet
        visible={showModeSheet}
        isLoading={isStartingMatch}
        error={matchError}
        onClose={() => !isStartingMatch && setShowModeSheet(false)}
        onSelectMode={async (mode: GameMode) => {
          const didStart = await startMatch(mode);
          if (didStart) {
            setShowModeSheet(false);
            navigation.replace('Countdown', { gameMode: mode });
          }
        }}
      />
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
    height: 274,
    zIndex: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vsDivider: {
    flex: 1,
    height: 1,
    backgroundColor: dark.bgGlass,
  },
  vsCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: dark.borderActiveMuted,
    flexShrink: 0,
  },
  vsText: {
    color: dark.textAccent,
    ...textStyle.titleCard,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
    backgroundColor: alpha.black[80],
  },
});
