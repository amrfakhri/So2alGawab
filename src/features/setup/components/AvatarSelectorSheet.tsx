import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TeamId } from '../../game/types/game';
import {
  alpha,
  dark,
  r,
  radius,
  spacing,
} from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';
import { SheetHeader } from '../../../shared/components/SheetHeader';

const AVATARS = [
  '🦁', '🦅', '🐯', '🦊', '🐺', '🦋', '🦄', '🐉',
  '🦈', '🦅', '🦆', '🦚', '🦜', '🦉', '🐸', '🦀',
  '🦂', '🐊', '🦏', '🦛', '🐘', '🐆', '🦓', '🦍',
  '⚡', '🔥', '🌊', '🌪️', '💎', '⭐', '🏆', '🎯',
];

interface AvatarSelectorSheetProps {
  visible: boolean;
  teamId: TeamId;
  currentAvatar: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

export function AvatarSelectorSheet({
  visible,
  teamId,
  currentAvatar,
  onSelect,
  onClose,
}: AvatarSelectorSheetProps) {
  const { t } = useLocale('setup');
  const insets = useSafeAreaInsets();

  const isA = teamId === 'A';
  const accentColor = isA ? dark.textAccent : dark.textHighlight;
  const activeBg    = isA ? alpha.gold[16]  : dark.bgHighlightSubtle;
  const activeBorder = isA ? dark.borderActiveMuted : dark.borderFocusRing;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Drag handle */}
        <View style={styles.dragger} />

        {/* Header */}
        <SheetHeader
          title={t('team_setup.avatar_sheet_title')}
          subtitle={t('team_setup.avatar_sheet_subtitle')}
        />

        {/* Emoji grid */}
        <FlatList
          data={AVATARS}
          keyExtractor={(item) => item}
          numColumns={8}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isActive = item === currentAvatar;
            return (
              <Pressable
                onPress={() => { onSelect(item); onClose(); }}
                style={({ pressed }) => [
                  styles.emojiCell,
                  isActive && { backgroundColor: activeBg, borderColor: activeBorder },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.emoji}>{item}</Text>
              </Pressable>
            );
          }}
          contentContainerStyle={styles.grid}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: dark.bgOverlay,
  },
  sheet: {
    borderTopLeftRadius: r.card,
    borderTopRightRadius: r.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
    overflow: 'hidden',
    backgroundColor: alpha.black[92],
  },
  dragger: {
    width: 60,
    height: 8,
    borderRadius: r.button,
    alignSelf: 'center',
    backgroundColor: dark.bgCardAlt,
  },
  grid: {
    gap: spacing['2xs'],
  },
  emojiCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    margin: 3,
  },
  emoji: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  pressed: { opacity: 0.7 },
});
