import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { WebLayout } from './src/components/layout/WebLayout';
import { TvScreen } from './src/features/tv/TvScreen';
import { TvLobbyScreen } from './src/features/tv/TvLobbyScreen';
import './src/localization/i18n';
import { loadStoredLanguage } from './src/localization/i18n';
import { initializeLanguage } from './src/localization/languageStore';

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
  const tvRoute = getTvRoute();

  useEffect(() => {
    loadStoredLanguage().then((lang) => {
      initializeLanguage(lang);
      setLangReady(true);
    });
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
          <StatusBar style="dark" />
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </WebLayout>
  );
}
