import { I18nManager, Platform } from 'react-native';
import { create } from 'zustand';

import i18n, { AppLanguage, persistLanguage } from './i18n';

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

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'ar',
  isRTL: true,
  setLanguage: async (lang) => {
    const isRTL = lang === 'ar';
    await i18n.changeLanguage(lang);
    await persistLanguage(lang);
    applyDirection(isRTL);
    set({ language: lang, isRTL });
  },
}));

export function initializeLanguage(lang: AppLanguage) {
  const isRTL = lang === 'ar';
  applyDirection(isRTL);
  useLanguageStore.setState({ language: lang, isRTL });
}
