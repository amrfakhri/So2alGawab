import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LifelineId, TeamState } from '../types/game';
import { colors } from '../../../shared/theme/colors';
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon';

interface LifelineBarProps {
  team: TeamState;
  onUseLifeline: (id: LifelineId) => void;
  vertical?: boolean;
}

const LIFELINE_IDS: LifelineId[] = ['callFriend', 'discardQuestion', 'answerReward'];

const LIFELINE_ICON_MAP: Record<LifelineId, AppIconName> = {
  callFriend: 'lifeline-call',
  discardQuestion: 'lifeline-discard',
  answerReward: 'lifeline-reward',
};

export function LifelineBar({ team, onUseLifeline, vertical }: LifelineBarProps) {
  const { t } = useTranslation('game');

  return (
    <View style={[styles.wrapper, vertical && styles.verticalWrapper]}>
      {LIFELINE_IDS.map((id) => {
        const available = team.lifelines[id];
        return (
          <Pressable
            key={id}
            disabled={!available}
            onPress={() => onUseLifeline(id)}
            style={[
              styles.button,
              vertical && styles.verticalButton,
              !available && styles.disabled,
            ]}
          >
            <View style={styles.buttonContent}>
              <AppIcon
                name={LIFELINE_ICON_MAP[id]}
                size={13}
                color={available ? colors.text : colors.mutedText}
                weight="bold"
              />
              <Text style={[styles.text, !available && styles.disabledText]}>
                {t(`lifelines.${id}`)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  verticalWrapper: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verticalButton: {
    width: '100%',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  text: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  disabledText: {
    color: colors.mutedText,
  },
});
