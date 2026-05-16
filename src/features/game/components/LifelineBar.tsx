import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LifelineId, TeamState } from '../types/game';
import { alpha, dark, palette, r, radius, textStyle } from '../../../shared/theme/tokens';
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon';

interface LifelineBarProps {
  team: TeamState;
  onUseLifeline: (id: LifelineId) => void;
}

type LifelineTheme = {
  bg: string;
  border: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
};

const LIFELINE_THEMES: Record<LifelineId, LifelineTheme> = {
  callFriend:      { bg: alpha.gold[8],   border: palette.gold[600],  iconColor: palette.gold[400],  badgeBg: palette.gold[500],  badgeText: '#1A0F00' },
  discardQuestion: { bg: alpha.blue[16],  border: palette.blue[300],  iconColor: palette.blue[300],  badgeBg: palette.blue[400],  badgeText: '#FFFFFF' },
  answerReward:    { bg: '#440a18',       border: palette.error[400], iconColor: palette.error[400], badgeBg: palette.error[500], badgeText: '#FFFFFF' },
};

const LIFELINE_ICON_MAP: Record<LifelineId, AppIconName> = {
  callFriend:      'lifeline-call',
  discardQuestion: 'lifeline-discard',
  answerReward:    'lifeline-reward',
};

const LIFELINE_IDS: LifelineId[] = ['callFriend', 'discardQuestion', 'answerReward'];

export function LifelineBar({ team, onUseLifeline }: LifelineBarProps) {
  const { t } = useTranslation('game');

  return (
    <View style={styles.container}>
      {LIFELINE_IDS.map((id) => {
        const available = team.lifelines[id];
        const theme = LIFELINE_THEMES[id];
        return (
          <View key={id} style={styles.buttonWrapper}>
            <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.badgeText, { color: theme.badgeText }]}>
                {available ? '1' : '0'}
              </Text>
            </View>
            <Pressable
              disabled={!available}
              onPress={() => onUseLifeline(id)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.bg, borderColor: theme.border },
                !available && styles.buttonDisabled,
                pressed && available && styles.buttonPressed,
              ]}
            >
              <AppIcon
                name={LIFELINE_ICON_MAP[id]}
                size={14}
                color={available ? theme.iconColor : dark.textTertiary}
                weight="bold"
              />
              <Text
                style={[
                  styles.label,
                  { color: available ? dark.textPrimary : dark.textTertiary },
                ]}
                numberOfLines={1}
              >
                {t(`lifelines.${id}`)}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonWrapper: {
    flex: 1,
    paddingTop: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    start: 6,
    zIndex: 1,
    width: 20,
    height: 20,
    borderRadius: r.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  button: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  buttonDisabled: {
    opacity: 0.38,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  label: {
    ...textStyle.labelSm,
    fontWeight: '700',
    flexShrink: 1,
  },
});
