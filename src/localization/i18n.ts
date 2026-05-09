import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import arCommon from './locales/ar/common.json';
import arSettings from './locales/ar/settings.json';
import arErrors from './locales/ar/errors.json';
import arSetup from './locales/ar/setup.json';
import arGame from './locales/ar/game.json';
import arTv from './locales/ar/tv.json';
import enCommon from './locales/en/common.json';
import enSettings from './locales/en/settings.json';
import enErrors from './locales/en/errors.json';
import enSetup from './locales/en/setup.json';
import enGame from './locales/en/game.json';
import enTv from './locales/en/tv.json';

export const LANGUAGE_STORAGE_KEY = '@so2algawab_language';
export const DEFAULT_LANGUAGE: AppLanguage = 'ar';
export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export async function loadStoredLanguage(): Promise<AppLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as AppLanguage)) {
      return stored as AppLanguage;
    }
  } catch {}

  const deviceCode = Localization.getLocales()?.[0]?.languageCode;
  if (deviceCode && SUPPORTED_LANGUAGES.includes(deviceCode as AppLanguage)) {
    return deviceCode as AppLanguage;
  }

  return DEFAULT_LANGUAGE;
}

export async function persistLanguage(lang: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      common: arCommon,
      settings: arSettings,
      errors: arErrors,
      setup: arSetup,
      game: arGame,
      tv: arTv,
    },
    en: {
      common: enCommon,
      settings: enSettings,
      errors: enErrors,
      setup: enSetup,
      game: enGame,
      tv: enTv,
    },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'settings', 'errors', 'setup', 'game', 'tv'],
  interpolation: { escapeValue: false },

  // Warn on missing keys during development to catch untranslated strings early
  saveMissing: __DEV__,
  missingKeyHandler: (lngs, ns, key) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing translation key "${ns}:${key}" (${lngs.join(', ')})`);
    }
  },
});

export default i18n;
