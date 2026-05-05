import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LifelineId, TeamState } from '../types/game';
import { colors } from '../../../shared/theme/colors';

interface LifelineBarProps {
  team: TeamState;
  onUseLifeline: (id: LifelineId) => void;
  vertical?: boolean;
}

const labels: Record<LifelineId, string> = {
  callFriend: 'مساعدة',
  discardQuestion: 'تخطي',
  answerReward: 'مضاعفة',
};

export function LifelineBar({ team, onUseLifeline, vertical }: LifelineBarProps) {
  const ids = Object.keys(labels) as LifelineId[];

  return (
    <View style={[styles.wrapper, vertical && styles.verticalWrapper]}>
      {ids.map((id) => {
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
            <Text style={[styles.text, !available && styles.disabledText]}>
              {labels[id]}
            </Text>
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
  text: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  disabledText: {
    color: colors.mutedText,
  },
});
