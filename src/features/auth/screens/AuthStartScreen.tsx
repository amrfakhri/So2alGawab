import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthStackParamList } from '../../../navigation/RootNavigator';
import { useLocale } from '../../../localization/useLocale';
import { SpotlightFrame } from '../../../shared/components/SpotlightFrame';
import {
  alpha,
  dark,
  glow,
  gradients,
  r,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { AuthGameLogo } from '../components/AuthGameLogo';
import { SocialButton } from '../components/SocialButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthStart'>;

export function AuthStartScreen({ navigation }: Props) {
  const { t, isRTL } = useLocale('auth');
  const insets = useSafeAreaInsets();
  const setGuest = useAuthStore((s) => s.setGuest);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) Alert.alert(t('error_title'), error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    setAppleLoading(true);
    try {
      const { error } = await authService.signInWithApple();
      if (error && error.message !== 'Apple sign-in was cancelled') {
        Alert.alert(t('error_title'), error.message);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest();
  };

  const isAnyLoading = googleLoading || appleLoading;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Background gradient */}
      <LinearGradient
        colors={gradients.screen}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Gold spotlight at top */}
      <SpotlightFrame
        style={[styles.spotlight, { height: 244 + insets.top }]}
        opacity={0.5}
      />

      {/* Content */}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing['4xl'] + spacing.sm,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <AuthGameLogo />
        </View>

        {/* Buttons container */}
        <View style={styles.buttonsContainer}>
          {/* Social login */}
          <View style={styles.socialSection}>
            <SocialButton
              provider="google"
              label={t('continue_google')}
              onPress={handleGoogle}
              loading={googleLoading}
              disabled={isAnyLoading}
            />
            {Platform.OS === 'ios' && (
              <SocialButton
                provider="apple"
                label={t('continue_apple')}
                onPress={handleApple}
                loading={appleLoading}
                disabled={isAnyLoading}
              />
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Email / signup / guest actions */}
          <View style={styles.actionsSection}>
            {/* Login with email — gold CTA */}
            <Pressable
              onPress={() => navigation.navigate('EmailLogin')}
              disabled={isAnyLoading}
              style={({ pressed }) => [styles.fullWidthBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.ctaGold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryBtn, glow.gold.sm]}
              >
                <Text style={styles.primaryBtnLabel}>{t('login_email')}</Text>
              </LinearGradient>
            </Pressable>

            {/* Signup — glass secondary */}
            <Pressable
              onPress={() => navigation.navigate('SignUp')}
              disabled={isAnyLoading}
              style={({ pressed }) => [styles.fullWidthBtn, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={gradients.cardGlass}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnLabel}>{t('sign_up')}</Text>
              </LinearGradient>
            </Pressable>

            {/* Continue as guest — text + arrow, arrow always trails the label */}
            <Pressable
              onPress={handleGuest}
              disabled={isAnyLoading}
              hitSlop={8}
              style={({ pressed }) => [
                styles.guestBtn,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.guestLabel}>{t('continue_guest')}</Text>
              <ArrowRight size={20} color={dark.textPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  buttonsContainer: {
    gap: spacing.lg,
  },
  socialSection: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: alpha.white[8],
  },
  actionsSection: {
    gap: spacing.md,
  },
  fullWidthBtn: {
    width: '100%',
  },
  // Gold primary button
  primaryBtn: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryBtnLabel: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },
  // Glass secondary button
  secondaryBtn: {
    height: 56,
    borderRadius: r.button,
    borderWidth: 1.5,
    borderColor: dark.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryBtnLabel: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },
  // Guest text button
  guestBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: spacing['2xs'],
  },
  guestLabel: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },
  pressed: {
    opacity: dark.opPressed,
  },
});
