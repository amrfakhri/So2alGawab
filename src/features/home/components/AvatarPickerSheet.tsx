import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useLocale } from '../../../localization/useLocale';
import { alpha, dark, gradients, glow, radius, spacing, textStyle } from '../../../shared/theme/tokens';
import { AVATAR_IMAGES } from '../avatars';
import { useUserStore } from '../store/useUserStore';
import { ProfileAvatar } from './ProfileAvatar';

interface AvatarPickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AvatarPickerSheet({ visible, onClose }: AvatarPickerSheetProps) {
  const { t, textAlign, rowLTR } = useLocale('home');
  const insets = useSafeAreaInsets();
  const { avatarIndex, setAvatar } = useUserStore();

  const [pendingIndex, setPendingIndex] = useState(avatarIndex);

  function handleOpen() {
    setPendingIndex(avatarIndex);
  }

  async function handleUpdate() {
    await setAvatar(pendingIndex);
    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }]}
          onPress={() => {}}
        >
          {/* Glass background */}
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.sheetBg} />

          {/* Dragger */}
          <View style={styles.dragger} />

          {/* Content */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.headerBlock}>
              <Text style={[styles.headerTitle, { textAlign }]}>
                {t('avatar_picker.title')}
              </Text>
              <Text style={[styles.headerSubtitle, { textAlign }]}>
                {t('avatar_picker.subtitle')}
              </Text>
            </View>

            {/* Avatar grid */}
            <View style={styles.grid}>
              {AVATAR_IMAGES.map((_png, index) => {
                const selected = index === pendingIndex;
                return (
                  <Pressable
                    key={index}
                    onPress={() => setPendingIndex(index)}
                    style={({ pressed }) => [
                      styles.avatarWrap,
                      selected && styles.avatarWrapSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ProfileAvatar index={index} size={AVATAR_IMG_SIZE} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { flexDirection: rowLTR }]}>
            {/* Update — primary, flex:1 */}
            <Pressable
              onPress={handleUpdate}
              style={({ pressed }) => [styles.updateBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.ctaGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.updateBtnText}>{t('avatar_picker.update')}</Text>
            </Pressable>

            {/* Close — ghost */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={[alpha.white[8], alpha.white[4]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.closeBtnBorder} />
              <Text style={styles.closeBtnText}>{t('avatar_picker.close')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const AVATAR_SIZE = 56;      // outer wrapper (includes border space)
const AVATAR_IMG_SIZE = 48;  // actual image (AVATAR_SIZE - 4*2 border)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: alpha.black[60],
  },

  sheet: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing['2xl'],
    overflow: 'hidden',
  },
  sheetBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: alpha.black[80],
  },

  dragger: {
    width: 60,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: dark.bgCardAlt,
    alignSelf: 'center',
  },

  content: {
    gap: spacing.lg,
  },

  headerBlock: {
    gap: spacing['3xs'],
  },
  headerTitle: {
    color: dark.textPrimary,
    ...textStyle.numericScoreSm,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: dark.textTertiary,
    ...textStyle.labelMd,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapSelected: {
    borderColor: dark.textAccent,
    ...glow.gold.xs,
  },

  actions: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },

  updateBtn: {
    flex: 1,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...glow.gold.sm,
  },
  updateBtnText: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },

  closeBtn: {
    height: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  closeBtnBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
  },
  closeBtnText: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },
});
