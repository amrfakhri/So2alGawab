/**
 * Light-surface colour tokens for game screens (Question, Feedback, Results).
 *
 * All values sourced from the master token system (src/shared/theme/tokens.ts).
 * The shape is kept identical so existing imports compile unchanged.
 */
import { light, palette } from './tokens';

export const colors = {
  // Backgrounds
  background: light.bgBase,          // #F7F1E8
  surface:    light.bgSurface,       // #FFFDF8
  card:       light.bgCard,          // #FFFFFF

  // Text
  text:       light.textPrimary,     // #1F2937
  mutedText:  light.textSecondary,   // #6B7280

  // Brand / interactive
  primary:     light.btnPrimary,      // #D86F45
  primaryDark: light.btnPrimaryPressed, // #B85B36
  secondary:   light.secondary,       // #1B4965

  // Status
  success:  '#2E8B57',
  danger:   palette.error[600],       // #D43955
  warning:  '#D9A441',

  // Structural
  border:   light.borderSubtle,       // #E7D7C4
  shadow:   'rgba(31, 41, 55, 0.12)',

  // Team colors (light-theme game screens)
  teamA: light.teamA,                 // #1B4965
  teamB: light.teamB,                 // #9C4A5B
} as const;
