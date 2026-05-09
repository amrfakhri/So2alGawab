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
  /** 'right' in Arabic, 'left' in English */
  textAlign: 'right' | 'left';

  // ── Flex direction helpers ─────────────────────────────────────────────────
  /**
   * Row direction that preserves LTR visual order in both languages.
   * Use for layouts where item 1 should always appear on the left visually.
   * Arabic: 'row-reverse' | English: 'row'
   */
  rowLTR: 'row' | 'row-reverse';
  /**
   * Row direction that preserves RTL visual order in both languages.
   * Use for Arabic-primary layouts (e.g. content + sidebar).
   * Arabic: 'row' | English: 'row-reverse'
   */
  rowRTL: 'row' | 'row-reverse';

  // ── Number formatting ──────────────────────────────────────────────────────
  /** Format a number using the active locale (Arabic-Indic digits in ar) */
  localizedNumber: (n: number) => string;
}

/**
 * Primary localization hook. Combines i18next `t()` with RTL layout utilities
 * from the language store. Use instead of calling `useTranslation` + `useLanguageStore`
 * separately.
 *
 * @example
 * const { t, isRTL, textAlign } = useLocale('game');
 * // t('timer_label') → 'الوقت' or 'Time'
 * // textAlign → 'right' or 'left'
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
    rowLTR: isRTL ? 'row-reverse' : 'row',
    rowRTL: isRTL ? 'row' : 'row-reverse',
    localizedNumber: (n: number) =>
      n.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'),
  };
}
