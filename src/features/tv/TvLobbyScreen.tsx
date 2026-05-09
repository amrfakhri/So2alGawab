import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { createTvDevice, fetchTvDevice, TvDevice } from '../../services/supabase/sessionService';

type State =
  | { phase: 'creating' }
  | { phase: 'waiting'; device: TvDevice }
  | { phase: 'error'; message: string };

const POLL_INTERVAL_MS = 3000;

export function TvLobbyScreen() {
  const [state, setState] = useState<State>({ phase: 'creating' });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const device = await createTvDevice();
        if (cancelled) return;
        setState({ phase: 'waiting', device });

        pollRef.current = setInterval(async () => {
          const updated = await fetchTvDevice(device.pairing_code);
          if (cancelled) return;
          if (updated?.session_code) {
            clearInterval(pollRef.current!);
            // Navigate to active session — full page replace so TvScreen takes over
            window.location.replace(`/tv/${updated.session_code}`);
          }
        }, POLL_INTERVAL_MS);
      } catch (e) {
        if (!cancelled) {
          setState({ phase: 'error', message: e instanceof Error ? e.message : 'خطأ غير معروف' });
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>So2alGawab</Text>
        <Text style={styles.tagline}>شاشة العرض الثانية</Text>
      </View>

      {/* Main content */}
      <View style={styles.stage}>
        {state.phase === 'creating' && (
          <View style={styles.centerCol}>
            <ActivityIndicator size="large" color={tv.yellow} />
            <Text style={styles.statusText}>جاري التهيئة…</Text>
          </View>
        )}

        {state.phase === 'error' && (
          <View style={styles.centerCol}>
            <Text style={styles.errorText}>{state.message}</Text>
          </View>
        )}

        {state.phase === 'waiting' && (
          <View style={styles.centerCol}>
            {/* QR code */}
            <View style={styles.qrContainer}>
              <QRCode
                value={`so2algawab://connect-tv?code=${state.device.pairing_code}`}
                size={240}
                color="#111111"
                backgroundColor="#FFFFFF"
              />
            </View>

            {/* Pairing code */}
            <View style={styles.codeRow}>
              {state.device.pairing_code.split('').map((char, i) => (
                <View key={i} style={styles.codeCell}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
            </View>

            {/* Instructions */}
            <Text style={styles.instructionTitle}>كيف تتصل؟</Text>
            <View style={styles.steps}>
              <Text style={styles.step}>١  افتح تطبيق So2alGawab على الهاتف</Text>
              <Text style={styles.step}>٢  اضغط "ربط TV" وأدخل الرمز</Text>
              <Text style={styles.step}>٣  ستنتقل الشاشة تلقائياً للجلسة</Text>
            </View>

            {/* Waiting indicator */}
            <View style={styles.waitingRow}>
              <ActivityIndicator size="small" color={tv.muted} />
              <Text style={styles.waitingText}>في انتظار الاتصال…</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>game.amrfakhri.com/tv</Text>
      </View>
    </View>
  );
}

const tv = {
  bg: '#111111',
  surface: '#1C1C1E',
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
    paddingTop: 48,
    paddingBottom: 32,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: tv.border,
  },
  brand: {
    color: tv.yellow,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tagline: {
    color: tv.muted,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 48,
  },
  centerCol: {
    alignItems: 'center',
    gap: 32,
    width: '100%',
    maxWidth: 480,
  },
  qrContainer: {
    padding: 24,
    backgroundColor: tv.white,
    borderRadius: 28,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  codeCell: {
    width: 72,
    height: 88,
    backgroundColor: tv.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tv.border,
  },
  codeChar: {
    color: tv.yellow,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
  },
  instructionTitle: {
    color: tv.white,
    fontSize: 20,
    fontWeight: '800',
  },
  steps: {
    gap: 10,
    alignSelf: 'stretch',
    backgroundColor: tv.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: tv.border,
  },
  step: {
    color: tv.muted,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 24,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waitingText: {
    color: tv.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  statusText: {
    color: tv.muted,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: tv.error,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: tv.border,
  },
  footerText: {
    color: tv.border,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
