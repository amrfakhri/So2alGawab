import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  radius,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';
import { authService } from '../services/authService';
import { AuthGameLogo } from '../components/AuthGameLogo';
import { AuthInput } from '../components/AuthInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailLogin'>;

interface FormErrors { email?: string; password?: string }

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!email.trim()) errors.email = 'email_required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'email_invalid';
  if (!password) errors.password = 'password_required';
  else if (password.length < 6) errors.password = 'password_short';
  return errors;
}

export function EmailLoginScreen({ navigation }: Props) {
  const { t, isRTL } = useLocale('auth');
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { error } = await authService.signInWithEmail(email, password);
      if (error) {
        const msg =
          error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('credentials')
            ? t('error_invalid_credentials')
            : error.message;
        Alert.alert(t('error_title'), msg);
      }
      // On success the auth state listener in useAuthStore updates status automatically
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t('forgot_password'), t('forgot_enter_email'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('forgot_password'), t('email_invalid_prompt'));
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await authService.resetPassword(email);
      if (error) {
        Alert.alert(t('error_title'), error.message);
      } else {
        Alert.alert(t('forgot_password'), t('reset_sent'));
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={gradients.screen}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SpotlightFrame
        style={[styles.spotlight, { height: 244 + insets.top }]}
        opacity={0.5}
      />

      {/* Back button — absolute so it doesn't affect scroll layout */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [
          styles.backBtn,
          { top: insets.top + spacing.md, left: spacing.md },
          pressed && styles.pressed,
        ]}
        hitSlop={8}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[alpha.white[8], alpha.white[4]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.backBtnBorder} />
        <ChevronLeft
          size={20}
          color={dark.textPrimary}
          strokeWidth={2}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
      </Pressable>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 136,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <AuthGameLogo />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Inputs */}
            <View style={styles.inputs}>
              <AuthInput
                icon={Mail}
                placeholder={t('email_placeholder')}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.email ? t(`error_${errors.email}`) : undefined}
              />
              <AuthInput
                ref={passwordRef}
                icon={Lock}
                placeholder={t('password_placeholder')}
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                secureTextEntry
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                error={errors.password ? t(`error_${errors.password}`) : undefined}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Login button */}
              <Pressable
                onPress={handleLogin}
                disabled={loading || resetLoading}
                style={({ pressed }) => [styles.fullWidthBtn, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={gradients.ctaGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginBtn, glow.gold.sm]}
                >
                  <Text style={styles.loginBtnLabel}>
                    {loading ? t('logging_in') : t('login')}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Forgot password */}
              <Pressable
                onPress={handleForgotPassword}
                disabled={loading || resetLoading}
                hitSlop={8}
                style={({ pressed }) => [styles.forgotBtn, pressed && styles.pressed]}
              >
                <Text style={styles.forgotLabel}>
                  {resetLoading ? t('sending_reset') : t('forgot_password')}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: dark.bgBase,
  },
  flex: {
    flex: 1,
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  // ── Back button ──────────────────────────────────────────────────────────────
  // top + left/right are set inline (depend on insets and isRTL)
  backBtn: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backBtnBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
  },

  // ── Scroll content ───────────────────────────────────────────────────────────
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  inputs: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────────
  fullWidthBtn: {
    width: '100%',
  },
  loginBtn: {
    height: 56,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  loginBtnLabel: {
    color: dark.textInverse,
    ...textStyle.buttonMd,
    fontWeight: '700',
  },
  forgotBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  forgotLabel: {
    color: dark.textPrimary,
    ...textStyle.buttonMd,
  },
  pressed: {
    opacity: dark.opPressed,
  },
});
