import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { GameMode } from '../types/game';
import { colors } from '../../../shared/theme/colors';
import { useLocale } from '../../../localization/useLocale';
import { AppIcon } from '../../../shared/components/AppIcon';

interface GameModeSheetProps {
  visible: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
}

interface ModeCardProps {
  title: string;
  description: string;
  badge: string;
  badgeAccent: string;
  icon: React.ReactNode;
  disabled: boolean;
  onPress: () => void;
  isRTL: boolean;
}

function ModeCard({
  title,
  description,
  badge,
  badgeAccent,
  icon,
  disabled,
  onPress,
  isRTL,
}: ModeCardProps) {
  const textAlign = isRTL ? 'right' : 'left';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.modeCard,
        pressed && !disabled && styles.modeCardPressed,
        disabled && styles.modeCardDisabled,
      ]}
    >
      <View style={[styles.modeCardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.modeIconCircle}>{icon}</View>
        <View style={styles.modeCardText}>
          <View style={[styles.modeTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.modeTitle, { textAlign }]}>{title}</Text>
            <View style={[styles.modeBadge, { backgroundColor: badgeAccent }]}>
              <Text style={styles.modeBadgeText}>{badge}</Text>
            </View>
          </View>
          <Text style={[styles.modeDesc, { textAlign }]}>{description}</Text>
        </View>
        <AppIcon
          name="circle"
          size={20}
          color={colors.border}
          weight="regular"
        />
      </View>
    </Pressable>
  );
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={isLoading ? undefined : onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={[styles.sheetTitle, { textAlign }]}>{t('mode_sheet.title')}</Text>

        {/* Classic mode */}
        <ModeCard
          title={t('mode_sheet.classic_title')}
          description={t('mode_sheet.classic_desc')}
          badge={t('mode_sheet.classic_badge')}
          badgeAccent={colors.secondary}
          icon={<AppIcon name="trophy" size={22} color={colors.primary} weight="duotone" />}
          disabled={isLoading}
          onPress={() => onSelectMode('classic')}
          isRTL={isRTL}
        />

        {/* Teams Selection mode */}
        <ModeCard
          title={t('mode_sheet.selection_title')}
          description={t('mode_sheet.selection_desc')}
          badge={t('mode_sheet.selection_badge')}
          badgeAccent={colors.primary}
          icon={<AppIcon name="crown" size={22} color={colors.primary} weight="duotone" />}
          disabled={isLoading}
          onPress={() => onSelectMode('selection')}
          isRTL={isRTL}
        />

        {/* Loading / error feedback */}
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>{t('mode_sheet.loading')}</Text>
          </View>
        ) : null}

        {error && !isLoading ? (
          <Text style={[styles.errorText, { textAlign }]}>{error}</Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modeCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  modeCardPressed: {
    backgroundColor: '#FFF0E8',
    borderColor: colors.primary,
  },
  modeCardDisabled: {
    opacity: 0.5,
  },
  modeCardRow: {
    alignItems: 'center',
    gap: 14,
  },
  modeIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  modeCardText: {
    flex: 1,
    gap: 4,
  },
  modeTitleRow: {
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  modeBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modeDesc: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 19,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  loadingText: {
    color: colors.mutedText,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
