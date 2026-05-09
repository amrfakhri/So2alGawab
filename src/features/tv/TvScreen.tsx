import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { supabase } from '../../services/supabase/supabaseClient';
import { fetchSessionByCode, GameSession } from '../../services/supabase/sessionService';

// ── Types ──────────────────────────────────────────────────────────────────────
type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'loaded'; session: GameSession };

type Lifelines = {
  callFriend: boolean;
  discardQuestion: boolean;
  answerReward: boolean;
};

// ── Root component ─────────────────────────────────────────────────────────────

export function TvScreen({ sessionCode }: { sessionCode: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetchSessionByCode(sessionCode).then((session) => {
      if (cancelled) return;
      setState(session ? { status: 'loaded', session } : { status: 'not_found' });
    });

    const channel = supabase
      .channel(`session_${sessionCode}`)
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `session_code=eq.${sessionCode}` },
        (payload: any) => {
          if (!cancelled) setState({ status: 'loaded', session: payload.new as GameSession });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionCode]);

  if (state.status === 'loading') {
    return (
      <View style={[styles.root, styles.fullCenter]}>
        <ActivityIndicator size="large" color={tv.yellow} />
        <Text style={styles.loadingText}>جاري التحميل…</Text>
      </View>
    );
  }

  if (state.status === 'not_found') {
    return (
      <View style={[styles.root, styles.fullCenter]}>
        <Text style={styles.notFoundCode}>{sessionCode}</Text>
        <Text style={styles.notFoundTitle}>لم يتم العثور على الجلسة</Text>
        <Text style={styles.notFoundSub}>تحقق من الرمز وأعد المحاولة.</Text>
      </View>
    );
  }

  return <TvSessionView session={state.session} sessionCode={sessionCode} />;
}

// ── Session view ───────────────────────────────────────────────────────────────

function TvSessionView({ session, sessionCode }: { session: GameSession; sessionCode: string }) {
  const [timerMs, setTimerMs] = useState<number | null>(null);

  useEffect(() => {
    if (!session.timer_running || !session.timer_started_at || !session.timer_duration_ms) {
      setTimerMs(null);
      return;
    }
    const started = new Date(session.timer_started_at).getTime();
    const duration = session.timer_duration_ms;

    function tick() {
      setTimerMs(Math.max(0, duration - (Date.now() - started)));
    }
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [session.timer_running, session.timer_started_at, session.timer_duration_ms]);

  const isFinished = session.current_phase === 'finished';
  const isLobby = !session.current_phase || session.current_phase === 'lobby';
  const hasMedia = Boolean(session.current_media_url && session.current_media_type);

  return (
    <View style={styles.root}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.brandText}>So2alGawab</Text>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.sessionCodeText}>#{sessionCode}</Text>
      </View>

      {/* ── Main area ─────────────────────────────────────────────── */}
      {isFinished ? (
        <FinishedScreen session={session} />
      ) : (
        <>
          <View style={styles.stage}>
            {isLobby ? (
              <View style={styles.fullCenter}>
                <Text style={styles.waitingEmoji}>⏳</Text>
                <Text style={styles.waitingText}>في انتظار بدء الجلسة…</Text>
              </View>
            ) : (
              <View style={styles.contentRow}>
                {/* LEFT — media */}
                {hasMedia ? (
                  <View style={styles.mediaPanel}>
                    <TvMedia
                      mediaType={session.current_media_type!}
                      mediaUrl={session.current_media_url!}
                    />
                  </View>
                ) : null}

                {/* RIGHT — game info */}
                <View style={[styles.infoPanel, !hasMedia && styles.infoPanelFull]}>
                  {/* Top row: category + points + timer */}
                  <View style={styles.topRow}>
                    {session.current_category ? (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{session.current_category}</Text>
                      </View>
                    ) : null}
                    {session.question_points ? (
                      <View style={styles.pointsChip}>
                        <Text style={styles.pointsText}>{session.question_points} نقطة</Text>
                      </View>
                    ) : null}
                    {timerMs !== null && session.timer_duration_ms ? (
                      <TimerBadge remainingMs={timerMs} totalMs={session.timer_duration_ms} />
                    ) : null}
                  </View>

                  {/* Question */}
                  {session.current_question ? (
                    <Text style={[
                      styles.questionText,
                      { fontSize: hasMedia ? 34 : 48, lineHeight: hasMedia ? 46 : 62 },
                    ]}>
                      {session.current_question}
                    </Text>
                  ) : null}

                  {/* Answer reveal */}
                  {session.reveal_answer && session.current_answer ? (
                    <View style={styles.answerReveal}>
                      <Text style={styles.answerRevealLabel}>✓  الإجابة الصحيحة</Text>
                      <Text style={styles.answerRevealText}>{session.current_answer}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>

          {/* ── Score bar ───────────────────────────────────────────── */}
          <View style={styles.scoreBar}>
            <ScoreCard
              label="الفريق الأول"
              score={session.team1_score}
              color={tv.teamA}
              lifelines={session.team1_lifelines}
            />
            {session.current_phase ? (
              <View style={styles.phaseChip}>
                <Text style={styles.phaseText}>{phaseLabel(session.current_phase)}</Text>
              </View>
            ) : null}
            <ScoreCard
              label="الفريق الثاني"
              score={session.team2_score}
              color={tv.teamB}
              lifelines={session.team2_lifelines}
            />
          </View>
        </>
      )}
    </View>
  );
}

// ── Finished screen ────────────────────────────────────────────────────────────

function FinishedScreen({ session }: { session: GameSession }) {
  const { team1_score, team2_score } = session;
  const team1Wins = team1_score > team2_score;
  const team2Wins = team2_score > team1_score;
  const isTie = team1_score === team2_score;

  return (
    <View style={styles.finishedRoot}>
      <Text style={styles.finishedEmoji}>{isTie ? '🤝' : '🏆'}</Text>
      <Text style={styles.finishedTitle}>انتهت اللعبة</Text>

      <View style={styles.finishedScoreRow}>
        {/* Team A */}
        <View style={[
          styles.finishedCard,
          { borderColor: tv.teamA },
          team1Wins && styles.finishedWinnerCard,
        ]}>
          {team1Wins ? <Text style={styles.winnerCrown}>👑</Text> : null}
          <Text style={[styles.finishedTeamLabel, { color: tv.teamA }]}>الفريق الأول</Text>
          <Text style={[styles.finishedScore, { color: tv.teamA }]}>{team1_score}</Text>
          <Text style={styles.finishedScoreUnit}>نقطة</Text>
        </View>

        <Text style={styles.finishedVs}>VS</Text>

        {/* Team B */}
        <View style={[
          styles.finishedCard,
          { borderColor: tv.teamB },
          team2Wins && styles.finishedWinnerCard,
        ]}>
          {team2Wins ? <Text style={styles.winnerCrown}>👑</Text> : null}
          <Text style={[styles.finishedTeamLabel, { color: tv.teamB }]}>الفريق الثاني</Text>
          <Text style={[styles.finishedScore, { color: tv.teamB }]}>{team2_score}</Text>
          <Text style={styles.finishedScoreUnit}>نقطة</Text>
        </View>
      </View>

      <View style={[
        styles.resultChip,
        isTie ? styles.resultChipTie : styles.resultChipWin,
      ]}>
        <Text style={styles.resultText}>
          {isTie
            ? 'تعادل الفريقان!'
            : team1Wins
            ? '🎉  الفريق الأول يفوز!'
            : '🎉  الفريق الثاني يفوز!'}
        </Text>
      </View>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TimerBadge({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const seconds = Math.ceil(remainingMs / 1000);
  const ratio = remainingMs / totalMs;
  const color = ratio > 0.6 ? tv.yellow : ratio > 0.3 ? '#FF9F0A' : '#FF453A';
  return (
    <View style={[styles.timerBadge, { borderColor: color }]}>
      <Text style={[styles.timerSeconds, { color }]}>{seconds}</Text>
      <Text style={[styles.timerUnit, { color }]}>ث</Text>
    </View>
  );
}

function ScoreCard({ label, score, color, lifelines }: {
  label: string;
  score: number;
  color: string;
  lifelines: Lifelines | null;
}) {
  return (
    <View style={[styles.scoreCard, { borderColor: color }]}>
      <Text style={styles.teamLabel}>{label}</Text>
      <Text style={[styles.teamScore, { color }]}>{score}</Text>
      <LifelineRow lifelines={lifelines} />
    </View>
  );
}

const LIFELINE_ITEMS: Array<{ key: keyof Lifelines; icon: string }> = [
  { key: 'callFriend', icon: '📞' },
  { key: 'discardQuestion', icon: '✂️' },
  { key: 'answerReward', icon: '💎' },
];

function LifelineRow({ lifelines }: { lifelines: Lifelines | null }) {
  return (
    <View style={styles.lifelineRow}>
      {LIFELINE_ITEMS.map(({ key, icon }) => {
        const available = lifelines?.[key] ?? true;
        return (
          <View key={key} style={[styles.lifelineChip, !available && styles.lifelineChipUsed]}>
            <Text style={styles.lifelineIcon}>{icon}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TvMedia({ mediaType, mediaUrl }: { mediaType: string; mediaUrl: string }) {
  if (mediaType === 'image') {
    return (
      <Image
        source={{ uri: mediaUrl }}
        style={styles.mediaImage}
        resizeMode="contain"
      />
    );
  }
  if (mediaType === 'video') {
    return (
      <View style={styles.mediaVideoWrapper}>
        {React.createElement('video', {
          src: mediaUrl,
          controls: true,
          style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' },
        })}
      </View>
    );
  }
  if (mediaType === 'audio') {
    return (
      <View style={styles.mediaAudioWrapper}>
        <Text style={styles.audioIcon}>🎵</Text>
        {React.createElement('audio', {
          src: mediaUrl,
          controls: true,
          style: { width: '100%', marginTop: '16px' },
        })}
      </View>
    );
  }
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Design tokens ──────────────────────────────────────────────────────────────
const tv = {
  bg: '#111111',
  surface: '#1C1C1E',
  surfaceHigh: '#2C2C2E',
  yellow: '#FFD54A',
  white: '#FFFFFF',
  muted: '#8E8E93',
  teamA: '#4A9BFF',
  teamB: '#FF6B9B',
  border: '#2C2C2E',
  answerBg: '#0A2E1A',
  answerBorder: '#1A5C34',
  answerGreen: '#34D399',
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tv.bg,
    minHeight: '100vh' as any,
  },
  fullCenter: {
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
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: tv.border,
  },
  brandText: { color: tv.yellow, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
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
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  liveText: { color: '#FF3B30', fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
  sessionCodeText: { color: tv.muted, fontSize: 18, fontWeight: '700', letterSpacing: 2 },

  // Stage
  stage: { flex: 1, padding: 40 },
  contentRow: { flex: 1, flexDirection: 'row', gap: 40 },

  // Media panel (LEFT)
  mediaPanel: {
    flex: 4,
    backgroundColor: tv.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tv.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info panel (RIGHT)
  infoPanel: {
    flex: 5,
    gap: 24,
    justifyContent: 'center',
  },
  infoPanelFull: {
    flex: 1,
    alignItems: 'center',
  },

  // Top row (category + points + timer)
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: tv.yellow,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  categoryText: { color: '#111111', fontWeight: '900', fontSize: 20, letterSpacing: 0.5 },

  // Points chip
  pointsChip: {
    backgroundColor: '#1A1400',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: tv.yellow,
  },
  pointsText: { color: tv.yellow, fontSize: 15, fontWeight: '800' },

  // Timer
  timerBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    backgroundColor: tv.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSeconds: { fontSize: 26, fontWeight: '900', lineHeight: 28 },
  timerUnit: { fontSize: 11, fontWeight: '700' },

  // Question
  questionText: { color: tv.white, fontWeight: '800', textAlign: 'center' },

  // Answer reveal
  answerReveal: {
    backgroundColor: tv.answerBg,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: tv.answerBorder,
    paddingHorizontal: 36,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
  },
  answerRevealLabel: { color: tv.answerGreen, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  answerRevealText: { color: tv.white, fontSize: 38, fontWeight: '900', textAlign: 'center', lineHeight: 50 },

  // Media
  mediaImage: { flex: 1, alignSelf: 'stretch' },
  mediaVideoWrapper: { flex: 1, alignSelf: 'stretch' },
  mediaAudioWrapper: { padding: 40, alignItems: 'center', gap: 8 },
  audioIcon: { fontSize: 64 },

  // Lobby waiting
  waitingEmoji: { fontSize: 64 },
  waitingText: { color: tv.muted, fontSize: 28, fontWeight: '600', textAlign: 'center' },

  // Score bar
  scoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: tv.border,
    gap: 20,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: tv.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
  },
  teamLabel: { color: tv.muted, fontSize: 14, fontWeight: '700' },
  teamScore: { fontSize: 48, fontWeight: '900', lineHeight: 52 },
  lifelineRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  lifelineChip: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: tv.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tv.border,
  },
  lifelineChipUsed: { opacity: 0.2 },
  lifelineIcon: { fontSize: 15 },
  phaseChip: {
    backgroundColor: tv.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: tv.border,
  },
  phaseText: { color: tv.muted, fontWeight: '700', fontSize: 15, textAlign: 'center' },

  // ── Finished screen ──────────────────────────────────────────────────────
  finishedRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingHorizontal: 80,
    paddingVertical: 48,
  },
  finishedEmoji: { fontSize: 80 },
  finishedTitle: { color: tv.white, fontSize: 42, fontWeight: '900', letterSpacing: 1 },
  finishedScoreRow: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
    width: '100%' as any,
    maxWidth: 800,
    justifyContent: 'center',
  },
  finishedCard: {
    flex: 1,
    backgroundColor: tv.surface,
    borderRadius: 28,
    borderWidth: 2,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 8,
  },
  finishedWinnerCard: {
    borderWidth: 3,
    backgroundColor: '#171717',
  },
  winnerCrown: { fontSize: 40 },
  finishedTeamLabel: { fontSize: 18, fontWeight: '800' },
  finishedScore: { fontSize: 80, fontWeight: '900', lineHeight: 84 },
  finishedScoreUnit: { color: tv.muted, fontSize: 16, fontWeight: '700' },
  finishedVs: { color: tv.muted, fontSize: 28, fontWeight: '900' },
  resultChip: {
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderWidth: 2,
  },
  resultChipWin: { backgroundColor: '#0A2E0A', borderColor: '#34D399' },
  resultChipTie: { backgroundColor: '#1A1A2E', borderColor: '#6B7FFF' },
  resultText: { color: tv.white, fontSize: 28, fontWeight: '900', textAlign: 'center' },

  // Loading / not found
  loadingText: { color: tv.muted, fontSize: 18, fontWeight: '600' },
  notFoundCode: { color: tv.yellow, fontSize: 48, fontWeight: '900', letterSpacing: 6 },
  notFoundTitle: { color: tv.white, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  notFoundSub: { color: tv.muted, fontSize: 18, textAlign: 'center' },
});
