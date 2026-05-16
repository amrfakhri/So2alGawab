import { Session, User } from '@supabase/supabase-js';

export type AuthStatus = 'initializing' | 'authenticated' | 'guest' | 'unauthenticated';

export type AuthProvider = 'email' | 'google' | 'apple' | null;

export interface Profile {
  id: string;
  username: string | null;
  avatar_index: number;
  auth_provider: AuthProvider;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  xp: number;
  level: number;
  games_played: number;
  wins: number;
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isGuest: boolean;
}
