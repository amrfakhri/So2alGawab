import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../shared/theme/colors';
import { SUPPORTED_LANGUAGES, AppLanguage } from '../../localization/i18n';
import { useLanguageStore } from '../../localization/languageStore';
import { AppIcon } from '../../shared/components/AppIcon';

interface LanguageSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

const LANGUAGE_META: Record<AppLanguage, { flag: string; code: string }> = {
  ar: { flag: '🇸🇦', code: 'AR' },
  en: { flag: '🇺🇸', code: 'EN' },
};

export function LanguageSwitcher({ visible, onClose }: LanguageSwitcherProps) {
  const { t } = useTranslation('settings');
  const { language, setLanguage, isRTL } = useLanguageStore();

  async function handleSelect(lang: AppLanguage) {
    if (lang !== language) {
      await setLanguage(lang);
    }
    onClose();
  }

  const showDirectionNote = Platform.OS !== 'web';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('language_label')}</Text>
            <Text style={styles.sheetSubtitle}>{t('language_subtitle')}</Text>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = lang === language;
              const meta = LANGUAGE_META[lang];
              const nativeName = t(`languages.${lang}_native`);
              const translatedName = t(`languages.${lang}`);

              return (
                <Pressable
                  key={lang}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelect(lang)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={nativeName}
                >
                  {/* Left side: flag + names */}
                  <View style={[styles.optionLeft, { flexDirection: isRTL ? 'row' : 'row' }]}>
                    <View style={[styles.flagBadge, selected && styles.flagBadgeSelected]}>
                      <Text style={styles.flagEmoji}>{meta.flag}</Text>
                      <Text style={[styles.langCode, selected && styles.langCodeSelected]}>
                        {meta.code}
                      </Text>
                    </View>
                    <View style={styles.nameBlock}>
                      <Text style={[styles.nativeName, selected && styles.nativeNameSelected]}>
                        {nativeName}
                      </Text>
                      {nativeName !== translatedName ? (
                        <Text style={styles.translatedName}>{translatedName}</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Right side: selection indicator */}
                  <View style={[styles.indicator, selected && styles.indicatorSelected]}>
                    {selected ? (
                      <AppIcon name="check" size={13} color="#FFFFFF" weight="bold" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Native direction note */}
          {showDirectionNote && (
            <View style={styles.noteRow}>
              <View style={styles.noteContent}>
                <AppIcon name="info" size={14} color={colors.mutedText} />
                <Text style={styles.noteText}>{t('direction_note')}</Text>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 48,
    paddingTop: 14,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 24,
  },

  // Header
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 22,
    gap: 6,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '500',
  },

  // Options
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF8F5',
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },

  // Flag badge
  flagBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  flagBadgeSelected: {
    backgroundColor: '#FFF3EC',
    borderColor: colors.primary,
  },
  flagEmoji: {
    fontSize: 20,
  },
  langCode: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.mutedText,
    letterSpacing: 0.5,
  },
  langCodeSelected: {
    color: colors.primary,
  },

  // Language names
  nameBlock: {
    gap: 2,
  },
  nativeName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.mutedText,
  },
  nativeNameSelected: {
    color: colors.text,
  },
  translatedName: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '500',
  },

  // Note row
  noteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  // Selection indicator
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  indicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Note
  noteRow: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
