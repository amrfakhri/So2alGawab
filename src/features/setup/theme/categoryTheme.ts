/**
 * categorySelectionTheme — dark-surface semantic tokens for Setup, Home, TV screens.
 *
 * All values now sourced from the master token system (src/shared/theme/tokens.ts).
 * The shape is kept identical so existing imports continue to compile unchanged.
 */
import { dark, gradients } from '../../../shared/theme/tokens';

export const categorySelectionTheme = {
  // Backgrounds
  background:     dark.bgBase,           // #05070F
  glass:          dark.bgGlass,          // rgba(255,255,255,0.08)
  glassStrong:    dark.bgGlassStrong,    // rgba(255,255,255,0.12)
  glassSubtle:    dark.bgGlassSubtle,    // rgba(255,255,255,0.04)

  // Borders
  borderSubtle:   dark.borderSubtle,     // rgba(255,255,255,0.08)
  borderPrimary:  dark.borderDefault,    // rgba(255,255,255,0.16)

  // Text
  textPrimary:    dark.textPrimary,      // #FFFFFF
  textTertiary:   dark.textSecondary,    // #A8AEC1
  textQuaternary: dark.textTertiary,     // #7A8094

  // Accent (gold)
  accent:         dark.textAccent,       // #F5C84B
  accentStart:    gradients.cardGold[0], // #F6D366
  accentEnd:      gradients.cardGold[1], // #D9A92E
  accentSubtle:   dark.bgAccentSubtle,   // rgba(245,200,75,0.16)
  accentCardStart: gradients.cardGoldSoft[0], // rgba(245,200,75,0.24)
  accentCardEnd:   gradients.cardGoldSoft[1], // rgba(245,200,75,0.08)

  // Additional semantic slots used by HomeScreen / shared components
  error:          dark.statusError,      // #FF5C7A
} as const;
