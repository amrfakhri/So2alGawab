import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from '@supabase/supabase-js';

import { AppIcon } from './AppIcon';
import { ProfileAvatar } from '../../features/home/components/ProfileAvatar';
import { AvatarPickerSheet } from '../../features/home/components/AvatarPickerSheet';
import { LanguageSwitcher } from '../../features/settings/LanguageSwitcher';
import { useUserStore } from '../../features/home/store/useUserStore';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useLocale } from '../../localization/useLocale';
import {
  dark,
  gradients,
  r,
  radius,
  spacing,
  textStyle,
  zIndex,
} from '../theme/tokens';

const HEADER_HEIGHT = 150;

function deriveFirstName(user: User | null, isGuest: boolean, guestLabel: string): string {
  if (isGuest) return guestLabel;
  if (!user) return '';
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const full = String(meta.username ?? meta.full_name ?? meta.name ?? '').trim();
  if (full) return full.split(/\s+/)[0] ?? full;
  if (user.email) return user.email.split('@')[0] ?? user.email;
  return '';
}

export { HEADER_HEIGHT };

interface TabScreenHeaderProps {
  title?: string;
  subtitle?: string;

  namespace?: string | string[];

  showAvatar?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
}

export function TabScreenHeader({
  title,
  subtitle,
  namespace,
  showAvatar = true,
  showSettings = true,
  showNotifications = true,
}: TabScreenHeaderProps) {
  const { t, isRTL } = useLocale(namespace ?? 'home');
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuthStore();
  const { avatarIndex, loadAvatar } = useUserStore();
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => { loadAvatar(); }, []);

  const displayName = deriveFirstName(user, isGuest, t('guest_name'));

  const resolvedTitle = title ?? t('greeting');

  const resolvedSubtitle =
    subtitle ?? t('welcome', { name: displayName });

  return (
    <>
      <View
        style={[styles.header, { paddingTop: insets.top + spacing['2xs'] + 4 }]}
        pointerEvents="box-none"
      >
        <BlurView tint="dark" intensity={72} style={styles.headerGlass}>
          <LinearGradient
            colors={gradients.headerOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </BlurView>

        <View style={styles.headerRow}>
          {showAvatar && (
            <Pressable
              onPress={() => setShowAvatarPicker(true)}
              style={({ pressed }) => [pressed && styles.pressed]}
              hitSlop={4}
            >
              <ProfileAvatar index={avatarIndex} size={48} />
            </Pressable>
          )}

          <View style={styles.headerTextBlock}>
            <Text style={[styles.headerGreeting, isRTL ? styles.textRtl : styles.textLtr]}>
              {resolvedTitle}
            </Text>
            <Text style={[styles.headerName, isRTL ? styles.textRtl : styles.textLtr]}>
              {resolvedSubtitle}
            </Text>
          </View>

          <View style={styles.headerIcons}>
            {showSettings && (
              <Pressable
                onPress={() => setShowSettingsSheet(true)}
                style={({ pressed }) => [pressed && styles.pressed]}
                hitSlop={4}
              >
                <LinearGradient
                  colors={gradients.cardGlass}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBtn}
                >
                  <AppIcon name="settings-2" size={24} color={dark.iconTertiary} />
                </LinearGradient>
              </Pressable>
            )}

            {showNotifications && (
              <View style={styles.bellWrap}>
                <LinearGradient
                  colors={gradients.cardGlass}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBtn}
                >
                  <AppIcon name="bell" size={24} color={dark.iconTertiary} />
                </LinearGradient>
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>2</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      <LanguageSwitcher visible={showSettingsSheet} onClose={() => setShowSettingsSheet(false)} />
      <AvatarPickerSheet visible={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: HEADER_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    // justifyContent: 'flex-end',
    zIndex: zIndex.appbar,
  },
  headerGlass: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: dark.borderSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    gap: spacing.xs,
  },
  headerTextBlock: {
    flex: 1,
    alignItems:'flex-start',
    gap: 2,
  },
  headerGreeting: {
    color: dark.textTertiary,
    ...textStyle.labelSm,
  },
  headerName: {
    color: dark.textPrimary,
    ...textStyle.titleSectionSm,
    fontWeight: '800',
  },
  textLtr: { textAlign: 'left' },
  textRtl: { textAlign: 'right' },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexShrink: 0,
  },
  bellWrap: {
    position: 'relative',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: r.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },
  notifBadge: {
    position: 'absolute',
    top: -3, right: -3,
    zIndex: zIndex.raised,
    width: 20,
    height: 20,
    borderRadius: r.badge,
    backgroundColor: dark.statusError,
    borderWidth: 2,
    borderColor: dark.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: dark.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  pressed: { opacity: 0.72 },
});
