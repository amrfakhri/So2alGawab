import { supabase } from './supabaseClient';

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
