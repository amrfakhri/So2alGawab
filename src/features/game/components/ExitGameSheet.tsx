import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetHeader } from '../../../shared/components/SheetHeader';
import { alpha, dark, glow, gradients, r, radius, spacing, textStyle } from '../../../shared/theme/tokens';

interface ExitGameSheetProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitGameSheet({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm,
}: ExitGameSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}
          onPress={() => {}}
        >
          {/* Blurred glass background */}
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.sheetBg} />

          {/* Dragger */}
          <View style={styles.dragger} />

          {/* Title + subtitle */}
          <SheetHeader title={title} subtitle={body} textAlign="center" />

          {/* Actions */}
          <View style={styles.actions}>
            {/* Primary — End Game */}
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.ctaGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
            </Pressable>

            {/* Secondary — Continue Playing */}
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.cardGlass}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cancelBorder} />
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: alpha.black[60],
  },

  sheet: {
    borderTopLeftRadius: r.sheet,
    borderTopRightRadius: r.sheet,
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
    backgroundColor: dark.bgGlass,
    alignSelf: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...glow.gold.sm,
  },
  confirmBtnText: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },

  cancelBtn: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  cancelBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
  },
  cancelBtnText: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },

  pressed: {
    opacity: 0.75,
  },
});
