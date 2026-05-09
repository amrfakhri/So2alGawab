import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { fetchSessionByCode, GameSession } from '../../services/supabase/sessionService';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'loaded'; session: GameSession };

interface TvScreenProps {
  sessionCode: string;
}

export function TvScreen({ sessionCode }: TvScreenProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetchSessionByCode(sessionCode).then((session) => {
      if (cancelled) return;
      setState(session ? { status: 'loaded', session } : { status: 'not_found' });
    });

    // ─── Future: add Supabase realtime subscription here ─────────────────
    // const channel = supabase
    //   .channel(`session:${sessionCode}`)
    //   .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_sessions',
    //       filter: `session_code=eq.${sessionCode}` },
    //     (payload) => setState({ status: 'loaded', session: payload.new as GameSession }))
    //   .subscribe();
    // return () => { cancelled = true; supabase.removeChannel(channel); };
    // ─────────────────────────────────────────────────────────────────────

    return () => { cancelled = true; };
  }, [sessionCode]);

  if (state.status === 'loading') {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={tv.yellow} />
        <Text style={styles.loadingText}>جاري التحميل…</Text>
      </View>
    );
  }

  if (state.status === 'not_found') {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.notFoundCode}>{sessionCode}</Text>
        <Text style={styles.notFoundTitle}>لم يتم العثور على الجلسة</Text>
        <Text style={styles.notFoundSub}>تحقق من الرمز وأعد المحاولة.</Text>
      </View>
    );
  }

  const { session } = state;
  const hasQuestion = Boolean(session.current_question);

  return (
    <View style={styles.root}>
      {/* ── Header bar ──────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brandText}>So2alGawab</Text>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.sessionCodeText}>#{sessionCode}</Text>
      </View>

      {/* ── Main stage ──────────────────────────────────────────── */}
      <View style={styles.stage}>
        {hasQuestion ? (
          <>
            {session.current_category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{session.current_category}</Text>
              </View>
            ) : null}

            <Text style={styles.questionText}>{session.current_question}</Text>
          </>
        ) : (
          <View style={styles.center}>
            <Text style={styles.waitingEmoji}>⏳</Text>
            <Text style={styles.waitingText}>في انتظار السؤال التالي…</Text>
          </View>
        )}
      </View>

      {/* ── Score bar ───────────────────────────────────────────── */}
      <View style={styles.scoreBar}>
        <View style={[styles.scoreCard, { borderColor: tv.teamA }]}>
          <Text style={styles.teamLabel}>الفريق الأول</Text>
          <Text style={[styles.teamScore, { color: tv.teamA }]}>{session.team1_score}</Text>
        </View>

        {session.current_phase ? (
          <View style={styles.phaseChip}>
            <Text style={styles.phaseText}>{phaseLabel(session.current_phase)}</Text>
          </View>
        ) : null}

        <View style={[styles.scoreCard, { borderColor: tv.teamB }]}>
          <Text style={styles.teamLabel}>الفريق الثاني</Text>
          <Text style={[styles.teamScore, { color: tv.teamB }]}>{session.team2_score}</Text>
        </View>
      </View>
    </View>
  );
}

function phaseLabel(phase: string): string {
  const map: Record<string, string> = {
    lobby: 'انتظار',
    question: 'سؤال',
    waiting_answer: 'إجابة',
    answer_revealed: 'الكشف',
    result: 'النتيجة',
    finished: 'انتهت',
  };
  return map[phase] ?? phase;
}

// ── TV-specific design tokens ──────────────────────────────────────────────
const tv = {
  bg: '#111111',
  surface: '#1C1C1E',
  yellow: '#FFD54A',
  white: '#FFFFFF',
  muted: '#8E8E93',
  teamA: '#4A9BFF',
  teamB: '#FF6B9B',
  border: '#2C2C2E',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tv.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: tv.border,
  },
  brandText: {
    color: tv.yellow,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2A1A1A',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  sessionCodeText: {
    color: tv.muted,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Stage
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 80,
    gap: 36,
  },
  categoryBadge: {
    backgroundColor: tv.yellow,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  categoryText: {
    color: '#111111',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  questionText: {
    color: tv.white,
    fontSize: 52,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 68,
  },
  waitingEmoji: {
    fontSize: 64,
  },
  waitingText: {
    color: tv.muted,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Score bar
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: tv.border,
    gap: 24,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: tv.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
  },
  teamLabel: {
    color: tv.muted,
    fontSize: 16,
    fontWeight: '700',
  },
  teamScore: {
    fontSize: 52,
    fontWeight: '900',
  },
  phaseChip: {
    backgroundColor: tv.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: tv.border,
  },
  phaseText: {
    color: tv.muted,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },

  // Loading / not found
  loadingText: {
    color: tv.muted,
    fontSize: 18,
    fontWeight: '600',
  },
  notFoundCode: {
    color: tv.yellow,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
  },
  notFoundTitle: {
    color: tv.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  notFoundSub: {
    color: tv.muted,
    fontSize: 18,
    textAlign: 'center',
  },
});
