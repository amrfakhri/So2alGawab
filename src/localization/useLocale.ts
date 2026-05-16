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
   * Row direction that flows in reading order (start → end).
   * Returns 'row-reverse' in Arabic so the flex row mirrors to match RTL reading.
   * Apply to any row that should flip when the language is Arabic.
   */
  rowLTR: 'row' | 'row-reverse';
  /**
   * Row direction that flows against reading order (end → start).
   * Returns 'row' in Arabic (opposite of rowLTR).
   */
  rowRTL: 'row' | 'row-reverse';
  /**
   * True when the active language is RTL. Use to gate horizontal ScrollView
   * reversals and array reversals that emulate RTL scroll behaviour.
   */
  needsRTLScrollFix: boolean;

  // ── Number formatting ──────────────────────────────────────────────────────
  /** Format a number using the active locale (Arabic-Indic digits in ar) */
  localizedNumber: (n: number) => string;
}

/**
 * Primary localization hook. Combines i18next `t()` with RTL layout utilities.
 *
 * RTL layout is handled manually via these helpers on all platforms.
 * I18nManager.forceRTL is intentionally disabled to prevent auto-flipping of
 * all flex rows, which conflicts with selective manual RTL control.
 *
 * @example
 * const { t, isRTL, textAlign, rowLTR } = useLocale('game');
 * // t('timer_label') → 'الوقت' or 'Time'
 * // rowLTR → 'row-reverse' (Arabic) or 'row' (English)
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
    needsRTLScrollFix: isRTL,
    localizedNumber: (n: number) =>
      n.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'),
  };
}
