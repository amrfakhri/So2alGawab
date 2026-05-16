import { I18nManager, Platform } from 'react-native';
import { create } from 'zustand';
import * as Updates from 'expo-updates';

import i18n, { AppLanguage, persistLanguage, i18nInitPromise } from './i18n';

interface LanguageStore {
  language: AppLanguage;
  isRTL: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

function applyDirection(isRTL: boolean) {
  // RTL layout is handled manually via rowLTR/rowRTL helpers in useLocale.
  // I18nManager.forceRTL is intentionally NOT used — it auto-flips all flex rows
  // and conflicts with the manual helpers, causing a double-flip on native.
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
  }
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'ar',
  isRTL: true,
  setLanguage: async (lang) => {
    const isRTL = lang === 'ar';
    await i18n.changeLanguage(lang);
    await persistLanguage(lang);
    applyDirection(isRTL);
    set({ language: lang, isRTL });
    // No native reload needed — RTL is handled manually, not via I18nManager
  },
}));

export async function initializeLanguage(lang: AppLanguage): Promise<void> {
  await i18nInitPromise;
  const isRTL = lang === 'ar';
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  // One-time migration: if a previous build left I18nManager in RTL mode, clear it and
  // reload so native starts fresh with manual RTL (no I18nManager auto-flip).
  if (Platform.OS !== 'web' && I18nManager.isRTL) {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
    await Updates.reloadAsync();
    return;
  }
  applyDirection(isRTL);
  useLanguageStore.setState({ language: lang, isRTL });
}
