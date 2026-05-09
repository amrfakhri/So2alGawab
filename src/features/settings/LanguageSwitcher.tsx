import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../shared/theme/colors';
import { SUPPORTED_LANGUAGES, AppLanguage } from '../../localization/i18n';
import { useLanguageStore } from '../../localization/languageStore';

interface LanguageSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageSwitcher({ visible, onClose }: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const { language, setLanguage } = useLanguageStore();

  async function handleSelect(lang: AppLanguage) {
    if (lang !== language) {
      await setLanguage(lang);
    }
    onClose();
  }

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

          <Text style={styles.title}>{t('settings.language_label')}</Text>

          <View style={styles.options}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = lang === language;
              return (
                <Pressable
                  key={lang}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelect(lang)}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {t(`languages.${lang}`)}
                  </Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 48,
    paddingTop: 14,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 18,
    textAlign: 'center',
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  optionPressed: {
    opacity: 0.75,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.mutedText,
  },
  optionLabelSelected: {
    color: colors.text,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
});
