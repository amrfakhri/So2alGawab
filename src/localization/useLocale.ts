import { useTranslation } from 'react-i18next';
import { useLanguageStore } from './languageStore';
import { AppLanguage } from './i18n';

export interface LocaleUtils {
  /** i18next translate function for the bound namespace(s) */
  t: ReturnType<typeof useTranslation>['t'];
  /** Active language code: 'ar' | 'en' */
  language: AppLanguage;
  /** True when the active language is RTL (Arabic) */
  isRTL: boolean;
  /** Persist and apply a new language */
  setLanguage: (lang: AppLanguage) => Promise<void>;

  // ── Text alignment ─────────────────────────────────────────────────────────
  /** 'right' in Arabic, 'left' in English — RN does not auto-align text */
  textAlign: 'right' | 'left';
  // alignItems: 'flex-start' | 'flex-start';
  // justifyContent: 'flex-end' | 'flex-end';
  

  // ── Number formatting ──────────────────────────────────────────────────────
  /** Format a number using the active locale (Arabic-Indic digits in ar) */
  localizedNumber: (n: number) => string;
}

/**
 * Primary localization hook. Combines i18next `t()` with RTL layout utilities.
 *
 * Row direction, scroll order, and flex mirroring are handled natively by
 * I18nManager — use plain `flexDirection: 'row'` everywhere. For directional
 * icons (chevrons, arrows) apply `transform: [{ scaleX: isRTL ? -1 : 1 }]`.
 *
 * @example
 * const { t, isRTL, textAlign } = useLocale('game');
 */
export function useLocale(ns?: string | string[]): LocaleUtils {
  const { t } = useTranslation(ns ?? 'common');
  const { language, isRTL, setLanguage } = useLanguageStore();

  return {
    t,
    language,
    isRTL,
    setLanguage,
    textAlign: isRTL ? 'right' : 'left',
    // alignItems: isRTL ? 'flex-start' : 'flex-start',
    // justifyContent: isRTL ? 'flex-end' : 'flex-end',

    localizedNumber: (n: number) =>
      n.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'),
  };
}
