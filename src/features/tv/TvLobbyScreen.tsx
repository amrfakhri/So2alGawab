import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../localization/useLocale';

import { supabase } from '../../services/supabase/supabaseClient';
import {
  createTvDevice,
  fetchTvDevice,
  fetchSessionById,
  TvDevice,
} from '../../services/supabase/sessionService';

type State =
  | { phase: 'creating' }
  | { phase: 'waiting'; device: TvDevice }
  | { phase: 'error'; message: string };

const POLL_FALLBACK_MS = 5000;

export function TvLobbyScreen() {
  const { t } = useTranslation('tv');
  const { textAlign } = useLocale('tv');
  const [state, setState] = useState<State>({ phase: 'creating' });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = t('lobby.steps', { returnObjects: true }) as unknown as string[];
  const stepNums = t('lobby.step_nums', { returnObjects: true }) as unknown as string[];

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      try {
        const device = await createTvDevice();
        if (cancelled) return;
        setState({ phase: 'waiting', device });

        function handleConnected(sessionCode: string) {
          if (cancelled) return;
          if (pollRef.current) clearInterval(pollRef.current);
          if (channel) supabase.removeChannel(channel);
          window.location.replace(`/tv/${sessionCode}`);
        }

        channel = supabase
          .channel(`tv_device_${device.id}`)
          .on(
            'postgres_changes' as any,
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'tv_devices',
              filter: `id=eq.${device.id}`,
            },
            async (payload: any) => {
              const updated = payload.new as TvDevice;
              if (updated.game_session_id) {
                const session = await fetchSessionById(updated.game_session_id);
                if (session?.session_code) handleConnected(session.session_code);
              }
            },
          )
          .subscribe();

        pollRef.current = setInterval(async () => {
          if (cancelled) return;
          const updated = await fetchTvDevice(device.pairing_code);
          if (updated?.game_session_id) {
            const session = await fetchSessionById(updated.game_session_id);
            if (session?.session_code) handleConnected(session.session_code);
          }
        }, POLL_FALLBACK_MS);
      } catch (e) {
        if (!cancelled) {
          setState({ phase: 'error', message: e instanceof Error ? e.message : t('session_modal.unknown_error') });
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>{t('common:app_name', { ns: 'common' })}</Text>
        <Text style={styles.tagline}>{t('lobby.tagline')}</Text>
      </View>

      <View style={styles.stage}>
        {state.phase === 'creating' && (
          <View style={styles.centerCol}>
            <ActivityIndicator size="large" color={tv.yellow} />
            <Text style={styles.statusText}>{t('lobby.initializing')}</Text>
          </View>
        )}

        {state.phase === 'error' && (
          <View style={styles.centerCol}>
            <Text style={styles.errorText}>{state.message}</Text>
          </View>
        )}

        {state.phase === 'waiting' && (
          <View style={styles.layout}>
            <View style={styles.qrSection}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={`so2algawab://connect-tv?code=${state.device.pairing_code}`}
                  size={220}
                  color="#111111"
                  backgroundColor="#FFFFFF"
                />
              </View>

              <View style={styles.codeRow}>
                {state.device.pairing_code.split('').map((char, i) => (
                  <View key={i} style={styles.codeCell}>
                    <Text style={styles.codeChar}>{char}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.waitingRow}>
                <ActivityIndicator size="small" color={tv.muted} />
                <Text style={styles.waitingText}>{t('lobby.waiting')}</Text>
              </View>
            </View>

            <View style={styles.stepsSection}>
              <Text style={[styles.stepsTitle, { textAlign }]}>{t('lobby.how_to_connect')}</Text>
              <View style={styles.stepsList}>
                {steps.map((text, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{stepNums[i]}</Text>
                    </View>
                    <Text style={[styles.stepText, { textAlign }]}>{text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('lobby.footer_url')}</Text>
      </View>
    </View>
  );
}

const tv = {
  bg: '#111111',
  surface: '#1C1C1E',
  surfaceHigh: '#2C2C2E',
  yellow: '#FFD54A',
  white: '#FFFFFF',
  muted: '#8E8E93',
  border: '#2C2C2E',
  error: '#FF453A',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tv.bg,
    minHeight: '100vh' as any,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: tv.border,
  },
  brand: { color: tv.yellow, fontSize: 30, fontWeight: '900', letterSpacing: 1.5 },
  tagline: { color: tv.muted, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 48,
  },
  centerCol: { alignItems: 'center', gap: 24 },
  layout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 64,
    width: '100%',
    maxWidth: 900,
  },
  qrSection: { alignItems: 'center', gap: 28, flexShrink: 0 },
  stepsSection: { flex: 1, gap: 28 },
  qrContainer: { padding: 20, backgroundColor: tv.white, borderRadius: 24 },
  codeRow: { flexDirection: 'row', gap: 10 },
  codeCell: {
    width: 68,
    height: 84,
    backgroundColor: tv.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tv.surfaceHigh,
  },
  codeChar: { color: tv.yellow, fontSize: 44, fontWeight: '900' },
  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  waitingText: { color: tv.muted, fontSize: 15, fontWeight: '600' },
  stepsTitle: { color: tv.white, fontSize: 26, fontWeight: '900' },
  stepsList: { gap: 18 },
  stepRow: { alignItems: 'center', gap: 18 },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tv.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepBadgeText: { color: '#111111', fontSize: 18, fontWeight: '900' },
  stepText: { color: tv.white, fontSize: 20, fontWeight: '600', flex: 1, lineHeight: 28 },
  statusText: { color: tv.muted, fontSize: 18, fontWeight: '600' },
  errorText: { color: tv.error, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: tv.border,
  },
  footerText: { color: tv.surfaceHigh, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
});
