import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Shuffle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TeamId } from '../../game/types/game';
import {
  alpha,
  dark,
  glow,
  gradients,
  r,
  radius,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';
import { useLocale } from '../../../localization/useLocale';
import { SecondaryButton } from '../../../shared/components/SecondaryButton';

const AVATARS = [
  '🦈', '🐉', '🦊', '🦅', '🦁',
  '🐯', '🔥', '⚡', '👑', '🦂',
  '🐊', '🦄', '🦆', '🦇', '🦩',
  '🦥', '🕷️', '🦒', '🦕', '🐍',
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
  currentAvatar,
  onSelect,
  onClose,
}: AvatarSelectorSheetProps) {
  const { t } = useLocale('setup');
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(currentAvatar);

  function handleRandom() {
    const others = AVATARS.filter((a) => a !== selected);
    const pick = others[Math.floor(Math.random() * others.length)];
    setSelected(pick);
  }

  function handleConfirm() {
    onSelect(selected);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <BlurView intensity={30} tint="dark" style={styles.sheet}>
        <View style={[StyleSheet.absoluteFill, styles.sheetBg]} />

        {/* Drag handle */}
        <View style={styles.dragger} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header row: title block (right) + random button (left) */}
          <View style={styles.headerRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{t('team_setup.avatar_sheet_title')}</Text>
              <Text style={styles.subtitle}>{t('team_setup.avatar_sheet_subtitle')}</Text>
            </View>

            <Pressable
              onPress={handleRandom}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.cardGlass}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.randomBtn}
              >
                <Shuffle size={18} color={dark.textPrimary} strokeWidth={2} />
                <Text style={styles.randomLabel}>{t('team_setup.avatar_random')}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Avatar grid */}
          <View style={styles.grid}>
            {AVATARS.map((emoji) => {
              const isActive = emoji === selected;
              return (
                <Pressable
                  key={emoji}
                  onPress={() => setSelected(emoji)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={[styles.avatarCell, isActive && styles.avatarCellActive]}>
                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                    {isActive && (
                      <View style={styles.checkBadge}>
                        <Check size={16} color={dark.textInverse} strokeWidth={2.5} />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Bottom actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleConfirm}
              style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.ctaGold}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>{t('team_setup.avatar_confirm')}</Text>
              </LinearGradient>
            </Pressable>

            <SecondaryButton
              label={t('team_setup.avatar_cancel')}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: alpha.black[60],
  },
  sheet: {
    borderTopLeftRadius: r.sheet,
    borderTopRightRadius: r.sheet,
    overflow: 'hidden',
    paddingTop: spacing.md,
  },
  sheetBg: {
    backgroundColor: alpha.black[80],
  },
  dragger: {
    width: 60,
    height: 8,
    borderRadius: r.button,
    backgroundColor: dark.bgGlass,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },

  // ── Header row ─────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: spacing['2xs'],
  },
  title: {
    color: dark.textPrimary,
    ...textStyle.titleSectionMd,
    textAlign: 'auto',
  },
  subtitle: {
    color: dark.textSecondary,
    ...textStyle.labelMd,
    textAlign: 'auto',
  },
  randomBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xs'],
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
  },
  randomLabel: {
    color: dark.textPrimary,
    ...textStyle.labelMd,
  },

  // ── Avatar grid ────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  avatarCell: {
    width: 63,
    height: 63,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCellActive: {
    borderColor: dark.borderActive,
    ...glow.gold.xs,
  },
  avatarEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: dark.bgAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Bottom actions ─────────────────────────────────────────────────────────
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: r.button,
    ...glow.gold.sm,
  },
  confirmGradient: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  confirmText: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },

  pressed: { opacity: 0.72 },
});
