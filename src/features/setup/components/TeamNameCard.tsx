import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Pencil } from 'lucide-react-native';

import { TeamId } from '../../game/types/game';
import {
  alpha,
  dark,
  r,
  radius,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';

interface TeamNameCardProps {
  teamId: TeamId;
  name: string;
  avatar: string;
  onChangeName: (name: string) => void;
  onPressAvatar: () => void;
}

export function TeamNameCard({
  teamId,
  name,
  avatar,
  onChangeName,
  onPressAvatar,
}: TeamNameCardProps) {
  const { t, textAlign, isRTL } = useLocale('setup');

  const isA = teamId === 'A';

  const cardBg          = isA ? alpha.gold[16]        : dark.bgHighlightSubtle;
  const cardBorder      = isA ? dark.borderActiveMuted : dark.borderFocusRing;
  const avatarBg        = isA ? dark.bgAccent          : dark.bgHighlight;
  const labelColor      = isA ? dark.textAccent        : dark.textHighlight;
  const dividerColor    = isA
    ? 'rgba(255,210,48,0.4)'
    : 'rgba(81,162,255,0.4)';
  const editBtnBg       = isA ? dark.bgAccent          : dark.bgHighlight;
  const label           = isA
    ? t('team_setup.team_a_label')
    : t('team_setup.team_b_label');

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* Avatar column — leading side in RTL (visual right) */}
      <Pressable
        onPress={onPressAvatar}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
        hitSlop={8}
      >
        <View style={[styles.avatarBox, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarEmoji}>{avatar}</Text>
        </View>
        {/* Edit badge */}
        <View style={[styles.editBadge, { backgroundColor: editBtnBg }]}>
          <Pencil size={12} color={dark.textInverse} strokeWidth={2.5} />
        </View>
      </Pressable>

      {/* Text column — trailing flex in RTL (visual left) */}
      <View style={styles.textCol}>
        {/* Team label row */}
        <View style={styles.labelRow}>
          <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
          <Text style={[styles.teamLabel, { color: labelColor }]}>{label}</Text>
        </View>

        {/* Name input */}
        <View style={styles.inputWrap}>
          <Pencil size={15} color={dark.textTertiary} strokeWidth={2} />
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder={t('team_setup.name_placeholder')}
            placeholderTextColor={dark.textTertiary}
            style={[styles.input, { textAlign, writingDirection: isRTL ? 'rtl' : 'ltr' }]}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 0.5,
    padding: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },

  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: r.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: alpha.black[92],
  },
  pressed: { opacity: 0.75 },

  textCol: {
    flex: 1,
    gap: spacing.xs,
  },

  labelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  teamLabel: {
    ...textStyle.overline,
    fontWeight: '700',
    flexShrink: 0,
  },

  inputWrap: {
    height: 44,
    borderRadius: r.input,
    backgroundColor: 'rgba(5,7,15,0.6)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    color: dark.textPrimary,
    ...textStyle.bodySm,
    padding: 0,
  },
});
