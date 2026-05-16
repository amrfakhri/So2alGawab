import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '../../../services/supabase/supabaseClient';

const REDIRECT_SCHEME = 'so2algawab://auth-callback';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('code');
  } catch {
    return null;
  }
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  signInWithEmail: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email: email.trim(), password }),

  signUpWithEmail: (email: string, password: string, username?: string) =>
    supabase.auth.signUp({
      email: email.trim(),
      password,
      options: username
        ? { data: { username: username.trim() } }
        : undefined,
    }),

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_SCHEME,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { data: null, error };
    if (!data.url) return { data: null, error: new Error('No OAuth URL returned') };

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_SCHEME);

    if (result.type !== 'success') {
      return { data: null, error: new Error('Google sign-in was cancelled') };
    }

    const code = extractCodeFromUrl(result.url);
    if (!code) return { data: null, error: new Error('No auth code in redirect URL') };

    return supabase.auth.exchangeCodeForSession(code);
  },

  signInWithApple: async () => {
    // expo-apple-authentication is iOS-only; imported lazily to avoid Android crash
    if (Platform.OS !== 'ios') {
      return { data: null, error: new Error('Apple Sign In is only available on iOS') };
    }

    try {
      const AppleAuth = await import('expo-apple-authentication');

      const available = await AppleAuth.isAvailableAsync();
      if (!available) {
        return { data: null, error: new Error('Apple Sign In is not available on this device') };
      }

      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { data: null, error: new Error('Apple did not return an identity token') };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      return { data, error };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'ERR_REQUEST_CANCELED') {
        return { data: null, error: new Error('Apple sign-in was cancelled') };
      }
      return { data: null, error: err instanceof Error ? err : new Error('Apple sign-in failed') };
    }
  },

  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: REDIRECT_SCHEME,
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),
};
