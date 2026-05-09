import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { WebLayout } from './src/components/layout/WebLayout';
import { TvScreen } from './src/features/tv/TvScreen';

const queryClient = new QueryClient();

function getTvSessionCode(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/^\/tv\/([^/]+)$/);
  return match?.[1] ?? null;
}

export default function App() {
  const tvCode = getTvSessionCode();
  if (tvCode) {
    return <TvScreen sessionCode={tvCode} />;
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
