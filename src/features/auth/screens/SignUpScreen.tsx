import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, User } from 'lucide-react-native';
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
  dark,
  glow,
  gradients,
  r,
  spacing,
  textStyle,
} from '../../../shared/theme/tokens';
import { authService } from '../services/authService';
import { AuthGameLogo } from '../components/AuthGameLogo';
import { AuthInput } from '../components/AuthInput';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

interface FormErrors { username?: string; email?: string; password?: string }

function validate(username: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (!username.trim()) errors.username = 'error_username_required';
  else if (username.trim().length < 2) errors.username = 'error_username_short';
  if (!email.trim()) errors.email = 'error_email_required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'error_email_invalid';
  if (!password) errors.password = 'error_password_required';
  else if (password.length < 6) errors.password = 'error_password_short';
  return errors;
}

export function SignUpScreen({ navigation }: Props) {
  const { t } = useLocale('auth');
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    const errs = validate(username, email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data, error } = await authService.signUpWithEmail(email, password, username);
      if (error) {
        Alert.alert(t('error_title'), error.message);
        return;
      }
      // If email confirmation is required, Supabase returns user without session
      if (data.user && !data.session) {
        Alert.alert(t('check_email_title'), t('check_email_body'));
        navigation.navigate('EmailLogin');
      }
      // If no confirmation required, auth state listener handles navigation
    } finally {
      setLoading(false);
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
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
            <View style={styles.inputs}>
              <AuthInput
                icon={User}
                placeholder={t('username_placeholder')}
                value={username}
                onChangeText={(v) => { setUsername(v); setErrors((e) => ({ ...e, username: undefined })); }}
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.username ? t(errors.username) : undefined}
              />
              <AuthInput
                ref={emailRef}
                icon={Mail}
                placeholder={t('email_placeholder')}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.email ? t(errors.email) : undefined}
              />
              <AuthInput
                ref={passwordRef}
                icon={Lock}
                placeholder={t('password_placeholder')}
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                error={errors.password ? t(errors.password) : undefined}
              />
            </View>

            <View style={styles.actions}>
              {/* Sign Up button */}
              <Pressable
                onPress={handleSignUp}
                disabled={loading}
                style={({ pressed }) => [styles.fullWidthBtn, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={gradients.ctaGold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.signUpBtn, glow.gold.sm]}
                >
                  <Text style={styles.signUpBtnLabel}>
                    {loading ? t('creating_account') : t('sign_up')}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Already have account */}
              <Pressable
                onPress={() => navigation.navigate('EmailLogin')}
                disabled={loading}
                hitSlop={8}
                style={({ pressed }) => [styles.loginLinkBtn, pressed && styles.pressed]}
              >
                <Text style={styles.loginLinkLabel}>{t('have_account')}</Text>
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
  flex: { flex: 1 },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
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
  fullWidthBtn: {
    width: '100%',
  },
  signUpBtn: {
    height: 48,
    borderRadius: r.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  signUpBtnLabel: {
    color: dark.textInverse,
    ...textStyle.buttonSm,
    fontWeight: '700',
  },
  loginLinkBtn: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  loginLinkLabel: {
    color: dark.textPrimary,
    ...textStyle.buttonSm,
  },
  pressed: {
    opacity: dark.opPressed,
  },
});
