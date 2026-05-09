import { supabase } from './supabaseClient';

export const TV_BASE_URL = 'https://game.amrfakhri.com/tv';

export type GameSession = {
  id: string;
  session_code: string;
  current_question: string | null;
  current_category: string | null;
  current_phase: string | null;
  team1_score: number;
  team2_score: number;
  created_at: string;
  updated_at: string;
};

// Avoids visually ambiguous characters (0/O, 1/I/L)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateSessionCode(): string {
  return Array.from(
    { length: 4 },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join('');
}

export async function createGameSession(): Promise<GameSession> {
  const session_code = generateSessionCode();

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      session_code,
      current_question: 'في انتظار السؤال',
      current_category: 'في انتظار الفئة',
      current_phase: 'lobby',
      team1_score: 0,
      team2_score: 0,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'فشل إنشاء الجلسة');
  }

  return data as GameSession;
}

export async function fetchSessionByCode(code: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('session_code', code)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as GameSession;
}

export async function fetchSessionById(id: string): Promise<GameSession | null> {
  const { data } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data as GameSession | null;
}

// ── TV devices ────────────────────────────────────────────────────────────────
// Schema: id, pairing_code, status, game_session_id, created_at

export type TvDevice = {
  id: string;
  pairing_code: string;
  game_session_id: string | null;
  status: 'waiting' | 'connected';
  created_at: string;
};

export async function createTvDevice(): Promise<TvDevice> {
  const pairing_code = generateSessionCode();
  const { data, error } = await supabase
    .from('tv_devices')
    .insert({ pairing_code, status: 'waiting' })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'فشل إنشاء الجهاز');
  return data as TvDevice;
}

export async function fetchTvDevice(pairingCode: string): Promise<TvDevice | null> {
  const { data } = await supabase
    .from('tv_devices')
    .select('*')
    .eq('pairing_code', pairingCode)
    .maybeSingle();
  return data as TvDevice | null;
}

// sessionId = game_sessions.id (UUID)
export async function linkTvDeviceToSession(
  pairingCode: string,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from('tv_devices')
    .update({ game_session_id: sessionId, status: 'connected' })
    .eq('pairing_code', pairingCode);
  if (error) throw new Error(error.message ?? 'فشل ربط الجهاز');
}
