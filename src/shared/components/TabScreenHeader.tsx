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

export function TabScreenHeader() {
  const { t, isRTL } = useLocale('home');
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuthStore();
  const { avatarIndex, loadAvatar } = useUserStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => { loadAvatar(); }, []);

  const displayName = deriveFirstName(user, isGuest, t('guest_name'));

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
          <Pressable
            onPress={() => setShowAvatarPicker(true)}
            style={({ pressed }) => [pressed && styles.pressed]}
            hitSlop={4}
          >
            <ProfileAvatar index={avatarIndex} size={48} />
          </Pressable>

          <View style={styles.headerTextBlock}>
            <Text style={[styles.headerGreeting, isRTL ? styles.textRtl : styles.textLtr]}>
              {t('greeting')}
            </Text>
            <Text style={[styles.headerName, isRTL ? styles.textRtl : styles.textLtr]}>
              {t('welcome', { name: displayName })}
            </Text>
          </View>

          <View style={styles.headerIcons}>
            <View style={styles.iconBtn}>
              <AppIcon name="bell" size={20} color={dark.iconTertiary} />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>2</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setShowSettings(true)}
              style={({ pressed }) => [pressed && styles.pressed]}
              hitSlop={4}
            >
              <View style={styles.iconBtn}>
                <AppIcon name="globe" size={20} color={dark.iconTertiary} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <LanguageSwitcher visible={showSettings} onClose={() => setShowSettings(false)} />
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
    paddingBottom: spacing.md - 4,
    justifyContent: 'flex-end',
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
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTextBlock: {
    flex: 1,
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
  textRtl: { textAlign: 'left' },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: r.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    borderWidth: 1,
    borderColor: dark.borderDefault,
    backgroundColor: dark.bgGlassSubtle,
  },
  notifBadge: {
    position: 'absolute',
    top: -4, right: -4,
    zIndex: zIndex.raised,
    width: 18,
    height: 18,
    paddingHorizontal: spacing['3xs'],
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
