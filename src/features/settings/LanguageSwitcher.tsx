import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { SUPPORTED_LANGUAGES, AppLanguage } from '../../localization/i18n';
import { useLanguageStore } from '../../localization/languageStore';
import { useLocale } from '../../localization/useLocale';
import { AppIcon } from '../../shared/components/AppIcon';
import { alpha, dark, radius, spacing, textStyle } from '../../shared/theme/tokens';

interface LanguageSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGE_META: Record<AppLanguage, { flag: string; label: string }> = {
  ar: { flag: '🇸🇦', label: 'العربية' },
  en: { flag: '🇬🇧', label: 'English' },
};

export function LanguageSwitcher({ visible, onClose }: LanguageSwitcherProps) {
  const { t, textAlign, rowLTR } = useLocale('settings');
  const { language, setLanguage } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const [isApplying, setIsApplying] = useState(false);

  async function handleSelect(lang: AppLanguage) {
    if (lang === language) {
      onClose();
      return;
    }
    setIsApplying(true);
    await setLanguage(lang);
    setIsApplying(false);
    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={isApplying ? undefined : onClose}
    >
      <Pressable style={styles.overlay} onPress={isApplying ? undefined : onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }]}
          onPress={() => {}}
        >
          {/* Glass background */}
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.sheetBg} />

          {/* Dragger */}
          <View style={styles.dragger} />

          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.headerTitle}>
              {t('language_label')}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t('language_subtitle')}
            </Text>
          </View>

          {/* Language cards */}
          <View style={styles.cards}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = lang === language;
              const meta = LANGUAGE_META[lang];
              return (
                <Pressable
                  key={lang}
                  onPress={() => handleSelect(lang)}
                  style={({ pressed }) => [
                    styles.card,
                    { flexDirection: rowLTR },
                    selected ? styles.cardActive : styles.cardInactive,
                    pressed && styles.cardPressed,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={meta.label}
                >
                  {/* Flag icon — first child = rightmost in RTL via row-reverse */}
                  <View style={styles.flagBox}>
                    <Text style={styles.flagEmoji}>{meta.flag}</Text>
                  </View>

                  {/* Language label — fills middle */}
                  <Text style={[styles.langLabel, { textAlign, flex: 1 }]} numberOfLines={1}>
                    {meta.label}
                  </Text>

                  {/* Radio indicator — last child = leftmost in RTL */}
                  <View style={[styles.radio, selected && styles.radioActive]}>
                    {selected && (
                      <AppIcon name="check" size={14} color={dark.textInverse} weight="bold" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: dark.opPressed }]}
          >
            <LinearGradient
              colors={[alpha.white[8], alpha.white[4]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.closeBtnBorder} />
            <Text style={styles.closeBtnText}>{t('close_btn')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      {isApplying && (
        <View style={styles.applyingOverlay}>
          <View style={styles.applyingCard}>
            <ActivityIndicator size="large" color={dark.textAccent} />
            <Text style={styles.applyingText}>{t('applying_language')}</Text>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: alpha.black[60],
  },

  // ── Bottom sheet ─────────────────────────────────────────────────────────────
  sheet: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  sheetBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: alpha.black[80],
  },

  // ── Dragger ──────────────────────────────────────────────────────────────────
  dragger: {
    width: 60,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: dark.bgCardAlt,
    alignSelf: 'center',
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  headerBlock: {
    gap: spacing['3xs'],
  },
  headerTitle: {
    color: dark.textPrimary,
    ...textStyle.numericScoreSm,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: dark.textSecondary,
    ...textStyle.labelMd,
    textAlign: 'center',
  },

  // ── Language cards ───────────────────────────────────────────────────────────
  cards: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardActive: {
    backgroundColor: dark.bgGlass,
    borderWidth: 1.5,
    borderColor: dark.textAccent,
  },
  cardInactive: {
    backgroundColor: dark.bgGlass,
    borderWidth: 1,
    borderColor: dark.borderDefault,
  },
  cardPressed: {
    opacity: 0.75,
  },

  // ── Flag icon ────────────────────────────────────────────────────────────────
  flagBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: dark.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  flagEmoji: {
    fontSize: 22,
  },

  // ── Language label ───────────────────────────────────────────────────────────
  langLabel: {
    color: dark.textPrimary,
    ...textStyle.labelLg,
  },

  // ── Radio button ─────────────────────────────────────────────────────────────
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: dark.bgGlass,
    borderWidth: 1,
    borderColor: dark.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: {
    backgroundColor: dark.bgAccent,
    borderColor: dark.bgAccent,
  },

  // ── Close button ──────────────────────────────────────────────────────────────
  closeBtn: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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

  // ── Applying overlay ─────────────────────────────────────────────────────────
  applyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: alpha.black[60],
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyingCard: {
    backgroundColor: dark.bgCard,
    borderRadius: radius['2xl'],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 200,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  applyingText: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },
});
