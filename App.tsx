import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { WebLayout } from './src/components/layout/WebLayout';
import { TvScreen } from './src/features/tv/TvScreen';
import { TvLobbyScreen } from './src/features/tv/TvLobbyScreen';
import './src/localization/i18n';
import { loadStoredLanguage } from './src/localization/i18n';
import { initializeLanguage } from './src/localization/languageStore';
import { useAuthStore } from './src/features/auth/store/useAuthStore';

const queryClient = new QueryClient();

type TvRoute =
  | { type: 'lobby' }
  | { type: 'session'; code: string }
  | null;

function getTvRoute(): TvRoute {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path === '/tv' || path === '/tv/') return { type: 'lobby' };
  const match = path.match(/^\/tv\/([^/]+)$/);
  if (match?.[1]) return { type: 'session', code: match[1] };
  return null;
}

export default function App() {
  const [langReady, setLangReady] = useState(false);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const tvRoute = getTvRoute();

  useEffect(() => {
    async function bootstrap() {
      const lang = await loadStoredLanguage();
      // Run language init and auth init in parallel — neither depends on the other
      await Promise.all([
        initializeLanguage(lang),
        initializeAuth(),
      ]);
      setLangReady(true);
    }
    bootstrap();
  }, []);

  if (!langReady) return null;

  if (tvRoute?.type === 'lobby') {
    return <TvLobbyScreen />;
  }

  if (tvRoute?.type === 'session') {
    return <TvScreen sessionCode={tvRoute.code} />;
  }

  return (
    <WebLayout>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </WebLayout>
  );
}
