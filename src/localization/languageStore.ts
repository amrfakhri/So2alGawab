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
  if (Platform.OS !== 'web') {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  } else if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
  }
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: 'ar',
  isRTL: true,
  setLanguage: async (lang) => {
    const isRTL = lang === 'ar';
    const directionChanges = isRTL !== get().isRTL;

    await i18n.changeLanguage(lang);
    await persistLanguage(lang);
    applyDirection(isRTL);
    set({ language: lang, isRTL });

    if (Platform.OS !== 'web' && directionChanges) {
      await Updates.reloadAsync();
    }
  },
}));

export async function initializeLanguage(lang: AppLanguage): Promise<void> {
  await i18nInitPromise;
  const isRTL = lang === 'ar';
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
  applyDirection(isRTL);
  useLanguageStore.setState({ language: lang, isRTL });
}
