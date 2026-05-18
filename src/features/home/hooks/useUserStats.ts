import { useEffect, useState } from 'react';

import { fetchUserStats, UserStats } from '../../../services/supabase/statsService';
import { useAuthStore } from '../../auth/store/useAuthStore';

const DEFAULT_STATS: UserStats = { total_points: 0, wins: 0, games_played: 0 };

export function useUserStats() {
  const { user, isGuest } = useAuthStore();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);

  useEffect(() => {
    if (isGuest || !user) return;

    fetchUserStats(user.id)
      .then(setStats)
      .catch(() => {});
  }, [user?.id, isGuest]);

  return stats;
}
