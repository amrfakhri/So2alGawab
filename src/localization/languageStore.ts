import { I18nManager, Platform } from 'react-native';
import { create } from 'zustand';
import * as Updates from 'expo-updates';

import i18n, { AppLanguage, persistLanguage, i18nInitPromise } from './i18n';

interface LanguageStore {
  language: AppLanguage;
  isRTL: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

function applyWebDirection(isRTL: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en');
  }
}

function syncNativeDirection(isRTL: boolean) {
  // Set I18nManager immediately so the current render session uses the correct
  // direction. Persisted via UserDefaults/SharedPreferences — future cold starts
  // will already have the right value and skip this call.
  if (Platform.OS !== 'web' && I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'ar',
  isRTL: true,
  setLanguage: async (lang) => {
    const isRTL = lang === 'ar';
    await i18n.changeLanguage(lang);
    await persistLanguage(lang);
    applyWebDirection(isRTL);
    const directionChanging = Platform.OS !== 'web' && I18nManager.isRTL !== isRTL;
    syncNativeDirection(isRTL);
    set({ language: lang, isRTL });
    // Reload so native layout engine picks up the new direction.
    if (directionChanging) {
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
  applyWebDirection(isRTL);
  // forceRTL during init — takes effect for this session without reloading.
  // On the next cold start I18nManager.isRTL will already match, so this is a no-op.
  syncNativeDirection(isRTL);
  useLanguageStore.setState({ language: lang, isRTL });
}
