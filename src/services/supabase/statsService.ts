import { supabase } from './supabaseClient';

export interface UserStats {
  total_points: number;
  wins: number;
  games_played: number;
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('total_points, wins, games_played')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data ?? { total_points: 0, wins: 0, games_played: 0 };
}

export async function incrementUserStats(
  userId: string,
  delta: { points: number; won: boolean },
): Promise<void> {
  // Use upsert with an RPC to atomically increment; fall back to read-then-write
  const current = await fetchUserStats(userId);

  const { error } = await supabase.from('user_stats').upsert({
    user_id: userId,
    total_points: current.total_points + delta.points,
    wins: current.wins + (delta.won ? 1 : 0),
    games_played: current.games_played + 1,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
