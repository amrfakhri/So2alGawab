import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { supabase } from '../../services/supabase/supabaseClient';
import { fetchSessionByCode, GameSession } from '../../services/supabase/sessionService';
import { AppIcon, type AppIconName } from '../../shared/components/AppIcon';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'loaded'; session: GameSession };

type Lifelines = {
  callFriend: boolean;
  discardQuestion: boolean;
  answerReward: boolean;
};

export function TvScreen({ sessionCode }: { sessionCode: string }) {
  const { t } = useTranslation('tv');
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
        <Text style={styles.loadingText}>{t('game.loading')}</Text>
      </View>
    );
  }

  if (state.status === 'not_found') {
    return (
      <View style={[styles.root, styles.fullCenter]}>
        <Text style={styles.notFoundCode}>{sessionCode}</Text>
        <Text style={styles.notFoundTitle}>{t('game.not_found_title')}</Text>
        <Text style={styles.notFoundSub}>{t('game.not_found_sub')}</Text>
      </View>
    );
  }

  return <TvSessionView session={state.session} sessionCode={sessionCode} />;
}

function TvSessionView({ session, sessionCode }: { session: GameSession; sessionCode: string }) {
  const { t } = useTranslation('tv');
  const [timerMs, setTimerMs] = useState<number | null>(null);
  // Persists across TvMedia remounts — once the presenter taps, all future plays work without a prompt
  const [browserUnlocked, setBrowserUnlocked] = useState(false);

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
  // Media plays automatically while the question is active, stops on reveal/result
  const shouldPlayMedia = session.current_phase === 'question' && hasMedia;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brandText}>{t('common:app_name', { ns: 'common' })}</Text>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.sessionCodeText}>#{sessionCode}</Text>
      </View>

      {isFinished ? (
        <FinishedScreen session={session} />
      ) : (
        <>
          <View style={styles.stage}>
            {isLobby ? (
              <View style={styles.fullCenter}>
                <AppIcon name="waiting" size={64} color={tv.muted} weight="fill" />
                <Text style={styles.waitingText}>{t('game.waiting_session')}</Text>
              </View>
            ) : (
              <View style={styles.contentRow}>
                {hasMedia ? (
                  <View style={styles.mediaPanel}>
                    <TvMedia
                      key={session.current_media_url}
                      mediaType={session.current_media_type!}
                      mediaUrl={session.current_media_url!}
                      mediaPlaying={shouldPlayMedia}
                      browserUnlocked={browserUnlocked}
                      onUnlock={() => setBrowserUnlocked(true)}
                    />
                  </View>
                ) : null}

                <View style={[styles.infoPanel, !hasMedia && styles.infoPanelFull]}>
                  <View style={styles.topRow}>
                    {session.current_category ? (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{session.current_category}</Text>
                      </View>
                    ) : null}
                    {session.question_points ? (
                      <View style={styles.pointsChip}>
                        <Text style={styles.pointsText}>
                          {session.question_points} {t('game.points_suffix')}
                        </Text>
                      </View>
                    ) : null}
                    {timerMs !== null && session.timer_duration_ms ? (
                      <TimerBadge remainingMs={timerMs} totalMs={session.timer_duration_ms} />
                    ) : null}
                  </View>

                  {session.current_question ? (
                    <Text style={[
                      styles.questionText,
                      { fontSize: hasMedia ? 34 : 48, lineHeight: hasMedia ? 46 : 62 },
                    ]}>
                      {session.current_question}
                    </Text>
                  ) : null}

                  {session.reveal_answer && session.current_answer ? (
                    <View style={styles.answerReveal}>
                      <Text style={styles.answerRevealLabel}>{t('game.correct_answer_label')}</Text>
                      <Text style={styles.answerRevealText}>{session.current_answer}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>

          <View style={styles.scoreBar}>
            <ScoreCard
              label={t('game.team1_label')}
              score={session.team1_score}
              color={tv.teamA}
              lifelines={session.team1_lifelines}
            />
            {session.current_phase ? (
              <View style={styles.phaseChip}>
                <Text style={styles.phaseText}>{t(PHASE_KEYS[session.current_phase] ?? 'game.phases.lobby')}</Text>
              </View>
            ) : null}
            <ScoreCard
              label={t('game.team2_label')}
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

function FinishedScreen({ session }: { session: GameSession }) {
  const { t } = useTranslation('tv');
  const { team1_score, team2_score } = session;
  const team1Wins = team1_score > team2_score;
  const team2Wins = team2_score > team1_score;
  const isTie = team1_score === team2_score;

  const resultText = isTie
    ? t('game.finished.draw')
    : team1Wins
      ? t('game.finished.team1_wins')
      : t('game.finished.team2_wins');

  return (
    <View style={styles.finishedRoot}>
      <AppIcon
        name={isTie ? 'handshake' : 'trophy'}
        size={80}
        color={isTie ? '#6B7FFF' : tv.yellow}
        weight="fill"
      />
      <Text style={styles.finishedTitle}>{t('game.finished.title')}</Text>

      <View style={styles.finishedScoreRow}>
        <View style={[styles.finishedCard, { borderColor: tv.teamA }, team1Wins && styles.finishedWinnerCard]}>
          {team1Wins ? <AppIcon name="crown" size={40} color={tv.yellow} weight="fill" /> : null}
          <Text style={[styles.finishedTeamLabel, { color: tv.teamA }]}>{t('game.team1_label')}</Text>
          <Text style={[styles.finishedScore, { color: tv.teamA }]}>{team1_score}</Text>
          <Text style={styles.finishedScoreUnit}>{t('game.finished.score_unit')}</Text>
        </View>

        <Text style={styles.finishedVs}>VS</Text>

        <View style={[styles.finishedCard, { borderColor: tv.teamB }, team2Wins && styles.finishedWinnerCard]}>
          {team2Wins ? <AppIcon name="crown" size={40} color={tv.yellow} weight="fill" /> : null}
          <Text style={[styles.finishedTeamLabel, { color: tv.teamB }]}>{t('game.team2_label')}</Text>
          <Text style={[styles.finishedScore, { color: tv.teamB }]}>{team2_score}</Text>
          <Text style={styles.finishedScoreUnit}>{t('game.finished.score_unit')}</Text>
        </View>
      </View>

      <View style={[styles.resultChip, isTie ? styles.resultChipTie : styles.resultChipWin]}>
        <Text style={styles.resultText}>{resultText}</Text>
      </View>
    </View>
  );
}

function TimerBadge({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const { t } = useTranslation('tv');
  const seconds = Math.ceil(remainingMs / 1000);
  const ratio = remainingMs / totalMs;
  const color = ratio > 0.6 ? tv.yellow : ratio > 0.3 ? '#FF9F0A' : '#FF453A';
  return (
    <View style={[styles.timerBadge, { borderColor: color }]}>
      <Text style={[styles.timerSeconds, { color }]}>{seconds}</Text>
      <Text style={[styles.timerUnit, { color }]}>{t('game.timer_unit')}</Text>
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

const LIFELINE_ITEMS: Array<{ key: keyof Lifelines; iconName: AppIconName }> = [
  { key: 'callFriend', iconName: 'lifeline-call' },
  { key: 'discardQuestion', iconName: 'lifeline-discard' },
  { key: 'answerReward', iconName: 'lifeline-reward' },
];

function LifelineRow({ lifelines }: { lifelines: Lifelines | null }) {
  return (
    <View style={styles.lifelineRow}>
      {LIFELINE_ITEMS.map(({ key, iconName }) => {
        const available = lifelines?.[key] ?? true;
        return (
          <View key={key} style={[styles.lifelineChip, !available && styles.lifelineChipUsed]}>
            <AppIcon name={iconName} size={15} color={tv.white} weight="bold" />
          </View>
        );
      })}
    </View>
  );
}

function TvMedia({
  mediaType,
  mediaUrl,
  mediaPlaying,
  browserUnlocked,
  onUnlock,
}: {
  mediaType: string;
  mediaUrl: string;
  mediaPlaying: boolean;
  browserUnlocked: boolean;
  onUnlock: () => void;
}) {
  const videoRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const el = mediaType === 'video' ? videoRef.current : mediaType === 'audio' ? audioRef.current : null;
    if (!el) return;
    if (mediaPlaying) {
      if (!browserUnlocked) {
        // Browser hasn't had a user gesture yet — show the tap prompt
        setNeedsTap(true);
        return;
      }
      el.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
    } else {
      el.pause();
      setNeedsTap(false);
    }
  }, [mediaPlaying, mediaType, browserUnlocked]);

  function handleTap() {
    // Must call .play() synchronously inside the click handler so the browser
    // records a user gesture — waiting for a React re-render would lose it.
    const el = mediaType === 'video' ? videoRef.current : mediaType === 'audio' ? audioRef.current : null;
    if (el) { el.play().catch(() => {}); }
    onUnlock();       // persists in parent — future questions autoplay without a prompt
    setNeedsTap(false);
  }

  if (mediaType === 'image') {
    return <Image source={{ uri: mediaUrl }} style={styles.mediaImage} resizeMode="contain" />;
  }
  if (mediaType === 'video') {
    return (
      <View style={styles.mediaVideoWrapper}>
        {React.createElement('video', {
          ref: videoRef,
          src: mediaUrl,
          controls: true,
          style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' },
        })}
        {needsTap && (
          <Pressable style={styles.tapOverlay} onPress={handleTap}>
            <AppIcon name="play" size={64} color={tv.white} weight="fill" />
            <Text style={styles.tapOverlayText}>TAP TO PLAY</Text>
          </Pressable>
        )}
      </View>
    );
  }
  if (mediaType === 'audio') {
    return (
      <View style={styles.mediaAudioWrapper}>
        <AppIcon name="music-note" size={64} color={needsTap ? tv.yellow : tv.muted} weight="fill" />
        {React.createElement('audio', {
          ref: audioRef,
          src: mediaUrl,
          controls: true,
          style: { width: '100%', marginTop: '16px' },
        })}
        {needsTap && (
          <Pressable style={styles.tapOverlay} onPress={handleTap}>
            <AppIcon name="play" size={64} color={tv.white} weight="fill" />
            <Text style={styles.tapOverlayText}>TAP TO PLAY</Text>
          </Pressable>
        )}
      </View>
    );
  }
  return null;
}

const PHASE_KEYS: Record<string, string> = {
  lobby: 'game.phases.lobby',
  question: 'game.phases.question',
  waiting_answer: 'game.phases.waiting_answer',
  answer_revealed: 'game.phases.answer_revealed',
  result: 'game.phases.result',
  finished: 'game.phases.finished',
};

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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tv.bg, minHeight: '100vh' as any },
  fullCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
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
  stage: { flex: 1, padding: 40 },
  contentRow: { flex: 1, flexDirection: 'row', gap: 40 },
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
  infoPanel: { flex: 5, gap: 24, justifyContent: 'center' },
  infoPanelFull: { flex: 1, alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  categoryBadge: { backgroundColor: tv.yellow, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 10 },
  categoryText: { color: '#111111', fontWeight: '900', fontSize: 20, letterSpacing: 0.5 },
  pointsChip: {
    backgroundColor: '#1A1400',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: tv.yellow,
  },
  pointsText: { color: tv.yellow, fontSize: 15, fontWeight: '800' },
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
  questionText: { color: tv.white, fontWeight: '800', textAlign: 'center' },
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
  mediaImage: { flex: 1, alignSelf: 'stretch' },
  mediaVideoWrapper: { flex: 1, alignSelf: 'stretch' },
  mediaAudioWrapper: { padding: 40, alignItems: 'center', gap: 8 },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    cursor: 'pointer' as any,
  },
  tapOverlayText: {
    color: tv.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  waitingText: { color: tv.muted, fontSize: 28, fontWeight: '600', textAlign: 'center' },
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
  phaseChip: {
    backgroundColor: tv.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: tv.border,
  },
  phaseText: { color: tv.muted, fontWeight: '700', fontSize: 15, textAlign: 'center' },
  finishedRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingHorizontal: 80,
    paddingVertical: 48,
  },
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
  finishedWinnerCard: { borderWidth: 3, backgroundColor: '#171717' },
  finishedTeamLabel: { fontSize: 18, fontWeight: '800' },
  finishedScore: { fontSize: 80, fontWeight: '900', lineHeight: 84 },
  finishedScoreUnit: { color: tv.muted, fontSize: 16, fontWeight: '700' },
  finishedVs: { color: tv.muted, fontSize: 28, fontWeight: '900' },
  resultChip: { borderRadius: 999, paddingHorizontal: 40, paddingVertical: 18, borderWidth: 2 },
  resultChipWin: { backgroundColor: '#0A2E0A', borderColor: '#34D399' },
  resultChipTie: { backgroundColor: '#1A1A2E', borderColor: '#6B7FFF' },
  resultText: { color: tv.white, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  loadingText: { color: tv.muted, fontSize: 18, fontWeight: '600' },
  notFoundCode: { color: tv.yellow, fontSize: 48, fontWeight: '900', letterSpacing: 6 },
  notFoundTitle: { color: tv.white, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  notFoundSub: { color: tv.muted, fontSize: 18, textAlign: 'center' },
});
