/**
 * Lammah Design System — Design Tokens
 * Source of truth: design-tokens.tokens.json (Figma export)
 *
 * Structure:
 *  palette      → raw color primitives
 *  alpha        → pre-built transparent color strings
 *  spacing      → spacing scale (3xs…4xl)
 *  radius       → border-radius scale
 *  fontWeight   → font weight literals
 *  fontSize     → font size scale
 *  lineHeight   → line height scale
 *  textStyle    → pre-composed RN text style objects
 *  shadow       → elevation shadow presets
 *  glow         → colored glow shadow presets
 *  zIndex       → z-index scale
 *  gradients    → pre-built LinearGradient color arrays
 *  dark         → semantic tokens for dark-surface screens (Home, Setup, TV)
 *  light        → semantic tokens for light-surface screens (Game, Results)
 */

// ─── Primitive palette ────────────────────────────────────────────────────────

export const palette = {
  neutral: {
    0:   '#FFFFFF',
    25:  '#FAFBFD',
    50:  '#F4F5F8',
    100: '#D9DCE4',
    200: '#A8AEC1',
    300: '#7A8094',
    400: '#535A6E',
    500: '#3A4054',
    600: '#262B3D',
    700: '#1B1F2E',
    800: '#13162A',
    900: '#0A0D1F',
    950: '#05070F',
  },
  gold: {
    50:  '#FDF5DC',
    100: '#FBEAB0',
    200: '#F8DD82',
    300: '#F6D366',
    400: '#F5C84B',
    500: '#E9B838',
    600: '#D9A92E',
    700: '#B8881F',
    800: '#8A6315',
    900: '#5A410C',
  },
  blue: {
    50:  '#EAF1FE',
    100: '#CFDFFB',
    200: '#A3BFF8',
    300: '#7AA1F3',
    400: '#5B8DEF',
    500: '#3F73D9',
    600: '#2E5BB8',
    700: '#1F4393',
    800: '#152F6B',
    900: '#0C1B42',
  },
  error: {
    100: '#FFD8DF',
    400: '#FF5C7A',
    500: '#EC4865',
    600: '#D43955',
    700: '#A52840',
  },
  success: {
    100: '#D3F6E4',
    400: '#3DD68C',
    500: '#27C079',
    600: '#1FA76B',
    700: '#178052',
  },
  warning: {
    100: '#FFE9C2',
    400: '#F5A623',
    600: '#C97E0F',
    700: '#9B5F09',
  },
  purple: {
    400: '#A56EFF',
  },
} as const;

// ─── Alpha colour helpers ─────────────────────────────────────────────────────

export const alpha = {
  white: {
    4:  'rgba(255,255,255,0.04)',
    8:  'rgba(255,255,255,0.08)',
    12: 'rgba(255,255,255,0.12)',
    16: 'rgba(255,255,255,0.16)',
    24: 'rgba(255,255,255,0.24)',
    40: 'rgba(255,255,255,0.40)',
    64: 'rgba(255,255,255,0.64)',
    80: 'rgba(255,255,255,0.80)',
  },
  black: {
    8:  'rgba(5,7,15,0.08)',
    16: 'rgba(5,7,15,0.16)',
    24: 'rgba(5,7,15,0.24)',
    40: 'rgba(5,7,15,0.40)',
    60: 'rgba(5,7,15,0.60)',
    80: 'rgba(5,7,15,0.80)',
    92: 'rgba(5,7,15,0.92)',
  },
  gold: {
    8:  'rgba(245,200,75,0.08)',
    16: 'rgba(245,200,75,0.16)',
    24: 'rgba(245,200,75,0.24)',
    40: 'rgba(245,200,75,0.40)',
  },
  blue: {
    8:  'rgba(91,141,239,0.08)',
    16: 'rgba(91,141,239,0.16)',
    24: 'rgba(91,141,239,0.24)',
    40: 'rgba(91,141,239,0.40)',
  },
  error: {
    16: 'rgba(255,92,122,0.16)',
    24: 'rgba(255,92,122,0.24)',
  },
  success: {
    16: 'rgba(61,214,140,0.16)',
    24: 'rgba(61,214,140,0.24)',
  },
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────────
// Maps to Figma spacing tokens: 3xs=4, 2xs=8, xs=12, sm=16, md=24, lg=32, xl=48, 2xl=64, 3xl=80, 4xl=120

export const spacing = {
  none: 0,
  '3xs': 4,
  '2xs': 8,
  xs:   12,
  sm:   16,
  md:   24,
  lg:   32,
  xl:   48,
  '2xl': 64,
  '3xl': 80,
  '4xl': 120,
} as const;

// ─── Border radius scale ──────────────────────────────────────────────────────
// Semantic aliases: input=md(12), card=lg(16), modal/sheet=2xl(24), hero=3xl(32), pill=9999

export const radius = {
  none: 0,
  xs:   4,
  sm:   8,
  md:   12,   // input, tag
  lg:   16,   // card, chip, control
  xl:   20,   // card elevated
  '2xl': 24,  // modal, sheet, glass card
  '3xl': 32,  // hero card
  '4xl': 40,  // TV panel
  pill: 9999, // button, avatar, badge
} as const;

// Semantic radius aliases
export const r = {
  input:  radius.md,
  card:   radius['2xl'],
  modal:  radius['2xl'],
  sheet:  radius['2xl'],
  hero:   radius['3xl'],
  avatar: radius.pill,
  button: radius.pill,
  chip:   radius.pill,
  badge:  radius.pill,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '800' as const,
};

export const fontSize = {
  10: 10, 11: 11, 12: 12, 13: 13, 14: 14,
  16: 16, 18: 18, 20: 20, 24: 24, 28: 28,
  32: 32, 40: 40, 48: 48, 56: 56, 80: 80,
} as const;

export const lineHeight = {
  none:    1,
  tight:   1.1,
  snug:    1.25,
  normal:  1.5,
  relaxed: 1.75,
} as const;

/**
 * Pre-composed text style objects matching Figma typography tokens.
 * Usage: <Text style={[textStyle.labelSm, { color: dark.textSecondary }]} />
 */
export const textStyle = {
  // Display
  displayCinematic:  { fontSize: 56, fontWeight: '700' as const, letterSpacing: -2.24, lineHeight: 56 },
  displayHero:       { fontSize: 48, fontWeight: '700' as const, letterSpacing: -0.96, lineHeight: 53 },
  displayQuestion:   { fontSize: 32, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 40 },
  displayQuestionSm: { fontSize: 24, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 30 },
  displayTimer:      { fontSize: 40, fontWeight: '600' as const, letterSpacing: -0.8,  lineHeight: 40 },
  displayScore:      { fontSize: 56, fontWeight: '700' as const, letterSpacing: -1.12, lineHeight: 56 },
  displayScoreLg:    { fontSize: 80, fontWeight: '800' as const, letterSpacing: -3.2,  lineHeight: 80 },
  // Title
  titlePage:         { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.56, lineHeight: 35 },
  titleSectionLg:    { fontSize: 24, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 30 },
  titleSectionMd:    { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 25 },
  titleSectionSm:    { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 27 },
  titleCard:         { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 24 },
  // Label
  labelLg:           { fontSize: 16, fontWeight: '500' as const, letterSpacing: 0,     lineHeight: 20 },
  labelMd:           { fontSize: 14, fontWeight: '500' as const, letterSpacing: 0,     lineHeight: 18 },
  labelSm:           { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.24,  lineHeight: 15 },
  // Body
  bodyXl:            { fontSize: 20, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 30 },
  bodyLg:            { fontSize: 18, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 27 },
  bodyPrimary:       { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 24 },
  bodySm:            { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 21 },
  bodyXs:            { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 18 },
  // Caption
  captionMd:         { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 20 },
  captionSm:         { fontSize: 11, fontWeight: '400' as const, letterSpacing: 0,     lineHeight: 17 },
  // Button
  buttonLg:          { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 23 },
  buttonMd:          { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 20 },
  buttonSm:          { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 18 },
  // Overline
  overline:          { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.88,  lineHeight: 14 },
  // Numeric
  numericScoreLg:    { fontSize: 48, fontWeight: '700' as const, letterSpacing: -0.96, lineHeight: 48 },
  numericScoreMd:    { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.64, lineHeight: 32 },
  numericScoreSm:    { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0,     lineHeight: 25 },
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.32,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.40,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.48,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOpacity: 0.56,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

// Coloured glow shadows (used on CTA buttons, active states, TV reveals)
export const glow = {
  gold: {
    xs: { shadowColor: palette.gold[400], shadowOpacity: 0.24, shadowRadius: 8,  shadowOffset: { width: 0, height: 0 }, elevation: 2 },
    sm: { shadowColor: palette.gold[400], shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
    md: { shadowColor: palette.gold[400], shadowOpacity: 0.40, shadowRadius: 32, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
    lg: { shadowColor: palette.gold[400], shadowOpacity: 0.48, shadowRadius: 64, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  },
  blue: {
    sm: { shadowColor: palette.blue[400], shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
    md: { shadowColor: palette.blue[400], shadowOpacity: 0.44, shadowRadius: 32, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  },
  error: {
    sm: { shadowColor: palette.error[400], shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
    md: { shadowColor: palette.error[400], shadowOpacity: 0.44, shadowRadius: 32, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  },
  success: {
    sm: { shadowColor: palette.success[400], shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
    md: { shadowColor: palette.success[400], shadowOpacity: 0.40, shadowRadius: 32, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  },
} as const;

// ─── Z-index scale ────────────────────────────────────────────────────────────

export const zIndex = {
  base:     0,
  raised:   10,
  dropdown: 100,
  sticky:   200,
  appbar:   300,
  tabbar:   310,
  overlay:  400,
  modal:    500,
  toast:    600,
  tooltip:  700,
  max:      9999,
} as const;

// ─── Gradient colour arrays (for expo-linear-gradient) ────────────────────────

export const gradients = {
  // Glass surfaces (dark screens)
  cardGlass:      ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] as const,
  cardGlassH:     ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] as const,

  // Gold accents
  cardGold:       [palette.gold[300], palette.gold[600]] as const,
  cardGoldSoft:   [alpha.gold[24], alpha.gold[8]] as const,
  tabBarActive:   [alpha.gold[24], alpha.gold[8]] as const,

  // Blue accents
  cardBlue:       [palette.blue[400], palette.blue[700]] as const,
  cardBlueSoft:   [alpha.blue[24], alpha.blue[8]] as const,

  // Surface gradients (dark cards)
  cardSurface:    [palette.neutral[700], palette.neutral[800]] as const,
  cardSurfaceAlt: [palette.neutral[600], palette.neutral[700]] as const,

  // Hero / background
  heroMidnight:   [palette.neutral[950], palette.neutral[800]] as const,

  // Header overlay (dark → transparent, top to bottom)
  headerOverlay: [
    'rgba(8,10,18,0.94)',
    'rgba(10,12,22,0.88)',
    'rgba(10,12,22,0.72)',
    'rgba(10,12,22,0.24)',
    'rgba(10,12,22,0)',
  ] as const,

  // Footer / game setup footer
  footer:         [palette.neutral[600], palette.neutral[700]] as const,

  // Scrim
  scrimBottom:    ['rgba(5,7,15,0)', 'rgba(5,7,15,0.80)'] as const,

  // Game screen
  screen:        ['#1b1530', '#131021', '#0a0b12'] as const,
  teamGold:      ['rgba(245,200,75,0.24)', 'rgba(245,200,75,0.08)'] as const,
  teamBlue:      ['rgba(91,141,239,0.24)', 'rgba(91,141,239,0.08)'] as const,
  ctaGold:       ['#f6d366', '#d9a92e'] as const,
  ctaSuccess:    ['#3dd68c', '#178052'] as const,
  ctaError:      [palette.error[400], palette.error[700]] as const,
  timer:         ['#05070f', '#13162a'] as const,
  questionCard:  ['#3d2a1a', '#0a0d1f'] as const,
} as const;

// ─── Dark semantic tokens ─────────────────────────────────────────────────────
// Screens: Home, Setup, TV, CastToTvModal, GameModeSheet, SelectionBoard

export const dark = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bgBase:         palette.neutral[950],   // #05070F   — screen background
  bgSurface:      palette.neutral[900],   // #0A0D1F   — elevated surface
  bgCard:         palette.neutral[700],   // #1B1F2E   — card background
  bgCardAlt:      palette.neutral[600],   // #262B3D   — alt card / footer
  bgGlass:        alpha.white[8],         // white/8   — glass card fill
  bgGlassStrong:  alpha.white[12],        // white/12  — stronger glass
  bgGlassSubtle:  alpha.white[4],         // white/4   — subtle glass
  bgAccent:       palette.gold[400],      // #F5C84B   — avatar, accent bg
  bgAccentSubtle: alpha.gold[16],         // gold/16   — selected state bg
  bgOverlay:      alpha.black[60],        // black/60  — modal scrim
  bgOverlaySoft:  alpha.black[24],        // black/24  — soft overlay
  bgOverlayHard:  alpha.black[92],        // black/92  — header glass bg

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:    palette.neutral[0],     // #FFFFFF   — main text
  textSecondary:  palette.neutral[200],   // #A8AEC1   — secondary text
  textTertiary:   palette.neutral[300],   // #7A8094   — tertiary / muted
  textAccent:     palette.gold[400],      // #F5C84B   — accent (gold)
  textAccentMuted: palette.gold[200],     // #F8DD82   — eyebrow / muted accent
  textInverse:    palette.neutral[900],   // #0A0D1F   — text on gold bg
  textDisabled:   palette.neutral[300],   // #7A8094   — disabled
  textError:      palette.error[400],     // #FF5C7A   — error
  textSuccess:    palette.success[400],   // #3DD68C   — success

  // ── Borders ─────────────────────────────────────────────────────────────────
  borderSubtle:   alpha.white[8],         // white/8   — subtle card border
  borderDefault:  alpha.white[16],        // white/16  — default border
  borderStrong:   alpha.white[24],        // white/24  — strong border
  borderActive:   palette.gold[500],      // #E9B838   — active/focus border
  borderFocus:    palette.blue[400],      // #5B8DEF   — focus ring
  borderError:    palette.error[400],     // #FF5C7A   — error border

  // ── Icons ────────────────────────────────────────────────────────────────────
  iconPrimary:    palette.neutral[0],     // #FFFFFF
  iconSecondary:  palette.neutral[200],   // #A8AEC1
  iconTertiary:   palette.neutral[300],   // #7A8094
  iconAccent:     palette.gold[400],      // #F5C84B
  iconError:      palette.error[400],     // #FF5C7A
  iconHighlight:  palette.blue[400],      // #5B8DEF
  iconSuccess:    palette.success[400],   // #3DD68C
  iconInverse:    palette.neutral[900],   // #0A0D1F   — icon on gold bg

  // ── Interactive states ───────────────────────────────────────────────────────
  btnPrimary:         palette.gold[400],  // gold CTA bg
  btnPrimaryHover:    palette.gold[300],
  btnPrimaryPressed:  palette.gold[600],
  btnSecondary:       alpha.white[8],     // glass secondary bg
  btnSecondaryHover:  alpha.white[12],
  btnSecondaryPressed: alpha.white[16],
  btnDanger:          palette.error[400],
  btnHighlight:       palette.blue[400],

  // ── Gameplay ─────────────────────────────────────────────────────────────────
  answerIdle:         alpha.white[8],
  answerSelected:     alpha.gold[16],
  answerSelectedBorder: palette.gold[400],
  answerCorrect:      alpha.success[16],
  answerCorrectBorder: palette.success[500],
  answerWrong:        alpha.error[16],
  answerWrongBorder:  palette.error[500],
  teamA:              palette.gold[500],
  teamB:              palette.blue[500],
  timerSafe:          palette.success[500],
  timerCaution:       palette.warning[600],
  timerDanger:        palette.error[500],

  // ── Lifeline-specific backgrounds ────────────────────────────────────────────
  bgAccentMuted:      alpha.gold[8],         // gold/8    — hint lifeline bg
  bgErrorSubtle:      '#440a18',             // deep crimson — double-points bg
  bgSuccessSubtle:    '#08321f',             // deep green — answer reveal bg

  // ── Team setup ────────────────────────────────────────────────────────────────
  bgHighlightSubtle:  alpha.blue[16],        // rgba(91,141,239,0.16) — Team B card bg
  bgHighlight:        palette.blue[400],     // #5B8DEF — Team B avatar bg
  textHighlight:      palette.blue[400],     // #5B8DEF — Team B accent text
  borderActiveMuted:  palette.gold[600],     // #D9A92E — Team A card border
  borderFocusRing:    palette.blue[300],     // #7AA1F3 — Team B card border

  // ── Status / badge ───────────────────────────────────────────────────────────
  statusError:        palette.error[400],
  statusSuccess:      palette.success[500],
  statusWarning:      palette.warning[400],

  // ── Opacity ──────────────────────────────────────────────────────────────────
  opDisabled:  0.40,
  opPressed:   0.75,
  opMuted:     0.64,
} as const;

// ─── Light semantic tokens ────────────────────────────────────────────────────
// Screens: QuestionScreen, FeedbackScreen, ResultsScreen (warm light theme)

export const light = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bgBase:         '#F7F1E8',    // warm cream
  bgSurface:      '#FFFDF8',    // near-white warm
  bgCard:         '#FFFFFF',    // card white
  bgCardAlt:      palette.neutral[50],  // #F4F5F8
  bgAccentSubtle: '#FFF5EA',    // warm orange tint
  bgAudioPlayer:  '#FFF5EA',    // audio frame bg
  bgPresenterNote:'#FFF5EA',    // presenter notice bg

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:    '#1F2937',    // near-black (warm)
  textSecondary:  '#6B7280',    // muted
  textAccent:     '#D86F45',    // warm orange primary
  textAccentDark: '#B85B36',    // pressed/darker
  textError:      palette.error[600],
  textSuccess:    palette.success[700],
  textWarning:    palette.warning[700],

  // ── Borders ─────────────────────────────────────────────────────────────────
  borderSubtle:   '#E7D7C4',    // warm beige
  borderDefault:  '#D1C4B0',
  borderAccent:   '#F0C7B5',    // warm accent border
  borderAccentAlt:'#F1D8C5',    // audio frame border
  borderMedia:    '#EDD2BE',    // image/video frame border

  // ── Icons ────────────────────────────────────────────────────────────────────
  iconAccent:     '#D86F45',
  iconSecondary:  '#B85B36',

  // ── Gameplay ─────────────────────────────────────────────────────────────────
  answerIdle:              '#FFFFFF',
  answerSelected:          '#FBE8D9',
  answerSelectedBorder:    '#D86F45',
  answerCorrect:           '#DFF5E6',
  answerWrong:             '#F9E0E0',
  teamA:                   '#1B4965',
  teamB:                   '#9C4A5B',

  // ── Buttons ──────────────────────────────────────────────────────────────────
  btnPrimary:              '#D86F45',
  btnPrimaryPressed:       '#B85B36',

  // ── Team secondary colors ─────────────────────────────────────────────────────
  secondary:               '#1B4965',   // used as button color for cancel etc.
} as const;

// ─── Game layout constants ────────────────────────────────────────────────────

export const layout = {
  timerSize:       62,
  teamChipHeight:  48,
  avatarSize:      28,
  lifelineHeight:  44,
  mediaHeight:     220,
} as const;
