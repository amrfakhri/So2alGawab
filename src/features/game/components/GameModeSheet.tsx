import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { Check, ChessQueen, ChessKnight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameMode } from '../types/game';
import { useLocale } from '../../../localization/useLocale';
import { alpha, dark, gradients, r, radius, spacing, textStyle } from '../../../shared/theme/tokens';
import { SheetHeader } from '../../../shared/components/SheetHeader';
import { GoldPrimaryButton } from '../../setup/components/CategorySelectionUI';
import { SecondaryButton } from '../../../shared/components/SecondaryButton';

// ── RadioButton ───────────────────────────────────────────────────────────────

function RadioButton({ active }: { active: boolean }) {
  if (active) {
    return (
      <View style={styles.radioActive}>
        <Check size={14} color={dark.bgBase} strokeWidth={3} />
      </View>
    );
  }
  return <View style={styles.radioInactive} />;
}

// ── Per-mode selected styles ──────────────────────────────────────────────────

const CARD_STYLES = {
  classic: {
    unselectedColors: gradients.cardGlass,
    selectedColors:   gradients.cardSurface,
    selectedBorder:   dark.borderFocus,
  },
  selection: {
    unselectedColors: gradients.cardGlass,
    selectedColors:   gradients.cardGoldSoft,
    selectedBorder:   dark.borderActive,
  },
} as const;

// ── GameTypeCard ──────────────────────────────────────────────────────────────

interface GameTypeCardProps {
  mode: GameMode;
  title: string;
  description: string;
  badge?: string;
  iconGradient: readonly [string, string];
  icon: React.ReactNode;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  isRTL: boolean;
}

function GameTypeCard({
  mode,
  title,
  description,
  badge,
  iconGradient,
  icon,
  selected,
  disabled,
  onPress,
  isRTL,
}: GameTypeCardProps) {
  const textAlign = isRTL ? 'right' : 'left';
  const { unselectedColors, selectedColors, selectedBorder } = CARD_STYLES[mode];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => pressed && !disabled && styles.cardPressed}
    >
      <LinearGradient
        colors={selected ? selectedColors : unselectedColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.card,
          selected
            ? { borderColor: selectedBorder }
            : { borderColor: dark.borderSubtle },
        ]}
      >
        {/* Trailing: radio */}
        <RadioButton active={selected} />

        {/* Center: text */}
        <View style={styles.cardBody}>
          <View style={styles.cardTextGroup}>
            <Text style={[styles.cardTitle, { textAlign }]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.cardDesc, { textAlign }]} numberOfLines={3}>
              {description}
            </Text>
          </View>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>

        {/* Leading: icon box */}
        <LinearGradient
          colors={iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.iconBox}
        >
          {icon}
          <View style={styles.iconHighlight} />
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

// ── GameModeSheet ─────────────────────────────────────────────────────────────

interface GameModeSheetProps {
  visible: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
}

export function GameModeSheet({
  visible,
  isLoading,
  error,
  onClose,
  onSelectMode,
}: GameModeSheetProps) {
  const { t } = useTranslation('setup');
  const { isRTL, textAlign } = useLocale('setup');
  const insets = useSafeAreaInsets();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const handleConfirm = () => onSelectMode(selectedMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={isLoading ? undefined : onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Dragger */}
        <View style={styles.dragger} />

        {/* Header */}
        <SheetHeader
          title={t('mode_sheet.title')}
          subtitle={t('mode_sheet.subtitle')}
        />

        {/* Mode cards */}
        <View style={styles.cardList}>
          <GameTypeCard
            mode="classic"
            title={t('mode_sheet.classic_title')}
            description={t('mode_sheet.classic_desc')}
            badge={t('mode_sheet.classic_badge')}
            iconGradient={['#5B8DEF', '#1F4393'] as const}
            icon={<ChessQueen size={24} color="#FFFFFF" />}
            selected={selectedMode === 'classic'}
            disabled={isLoading}
            onPress={() => setSelectedMode('classic')}
            isRTL={isRTL}
          />
          <GameTypeCard
            mode="selection"
            title={t('mode_sheet.selection_title')}
            description={t('mode_sheet.selection_desc')}
            iconGradient={['#F6D366', '#D9A92E'] as const}
            icon={<ChessKnight size={24} color="#0A0D1F" />}
            selected={selectedMode === 'selection'}
            disabled={isLoading}
            onPress={() => setSelectedMode('selection')}
            isRTL={isRTL}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={dark.textAccent} />
            <Text style={styles.loadingText}>{t('mode_sheet.loading')}</Text>
          </View>
        ) : null}

        {error && !isLoading ? (
          <Text style={[styles.errorText, { textAlign }]}>{error}</Text>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <GoldPrimaryButton
            label={t('mode_sheet.confirm')}
            onPress={handleConfirm}
            disabled={isLoading}
            style={styles.confirmBtn}
          />
          <SecondaryButton
            label={t('mode_sheet.back')}
            onPress={onClose}
            disabled={isLoading}
            style={styles.backBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: dark.bgOverlay,
  },
  sheet: {
    borderTopLeftRadius: r.card,
    borderTopRightRadius: r.card,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
    overflow: 'hidden',
    backgroundColor: alpha.black[92],
  },
  dragger: {
    width: 60,
    height: 8,
    borderRadius: r.button,
    alignSelf: 'center',
    backgroundColor: dark.bgCardAlt,
  },
  // Cards
  cardList: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    borderRadius: r.card,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.8,
  },

  // Radio
  radioActive: {
    width: 24,
    height: 24,
    borderRadius: r.button,
    backgroundColor: dark.textAccent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioInactive: {
    width: 24,
    height: 24,
    borderRadius: r.button,
    backgroundColor: dark.bgGlass,
    borderWidth: 1,
    borderColor: dark.borderDefault,
    flexShrink: 0,
  },

  // Card body
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTextGroup: {
    gap: spacing['3xs'],
  },
  cardTitle: {
    color: dark.textPrimary,
    ...textStyle.titleCard,
    fontWeight: '700',
  },
  cardDesc: {
    color: dark.textTertiary,
    ...textStyle.bodyXs,
    lineHeight: 18,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: r.badge,
    borderWidth: 1,
    borderColor: dark.textAccent,
    backgroundColor: dark.bgGlass,
  },
  badgeText: {
    color: dark.textAccent,
    ...textStyle.captionSm,
    fontWeight: '600',
  },

  // Icon box
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius['2xl'],
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.3,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 1 },
  },

  // Footer
  footer: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  confirmBtn: {
    flex: 1,
  },
  backBtn: {
    flex: 1,
  },

  // Loading / error
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: dark.textTertiary,
    ...textStyle.bodySm,
    fontWeight: '600',
  },
  errorText: {
    color: dark.statusError,
    ...textStyle.captionMd,
    fontWeight: '600',
  },
});
