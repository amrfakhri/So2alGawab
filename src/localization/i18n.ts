import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import arCommon from './locales/ar/common.json';
import arSettings from './locales/ar/settings.json';
import arErrors from './locales/ar/errors.json';
import arSetup from './locales/ar/setup.json';
import arGame from './locales/ar/game.json';
import arTv from './locales/ar/tv.json';
import arHome from './locales/ar/home.json';
import arAuth from './locales/ar/auth.json';
import arGames from './locales/ar/games.json';
import arRanks from './locales/ar/ranks.json';
import arProfile from './locales/ar/profile.json';
import enCommon from './locales/en/common.json';
import enSettings from './locales/en/settings.json';
import enErrors from './locales/en/errors.json';
import enSetup from './locales/en/setup.json';
import enGame from './locales/en/game.json';
import enTv from './locales/en/tv.json';
import enHome from './locales/en/home.json';
import enAuth from './locales/en/auth.json';
import enGames from './locales/en/games.json';
import enRanks from './locales/en/ranks.json';
import enProfile from './locales/en/profile.json';

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

  return DEFAULT_LANGUAGE;
}

export async function persistLanguage(lang: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export const i18nInitPromise = i18n.use(initReactI18next).init({
  resources: {
    ar: {
      common: arCommon,
      settings: arSettings,
      errors: arErrors,
      setup: arSetup,
      game: arGame,
      tv: arTv,
      home: arHome,
      auth: arAuth,
      games: arGames,
      ranks: arRanks,
      profile: arProfile,
    },
    en: {
      common: enCommon,
      settings: enSettings,
      errors: enErrors,
      setup: enSetup,
      game: enGame,
      tv: enTv,
      home: enHome,
      auth: enAuth,
      games: enGames,
      ranks: enRanks,
      profile: enProfile,
    },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'settings', 'errors', 'setup', 'game', 'tv', 'home', 'auth', 'games', 'ranks', 'profile'],
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
