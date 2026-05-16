import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

import { supabase } from '../../../services/supabase/supabaseClient';
import { AuthState, AuthStatus, Profile } from '../types/auth';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  setGuest: () => void;
  signOut: () => Promise<void>;
  _setSession: (session: Session | null) => void;
  _setProfile: (profile: Profile | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: 'initializing',
  user: null,
  session: null,
  profile: null,
  isGuest: false,

  initialize: async () => {
    // Restore Supabase session from persisted storage (guest mode is never persisted)
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      set({ status: 'authenticated', user: session.user, session, isGuest: false });
    } else {
      set({ status: 'unauthenticated', user: null, session: null });
    }

    // Single persistent listener — cleaned up only when the store is garbage-collected
    supabase.auth.onAuthStateChange((_event, session) => {
      if (get().isGuest) return;
      if (session?.user) {
        set({ status: 'authenticated', user: session.user, session });
      } else {
        set({ status: 'unauthenticated', user: null, session: null, profile: null });
      }
    });
  },

  // Guest mode is session-only — never written to AsyncStorage so it clears on relaunch
  setGuest: () => {
    set({ status: 'guest', isGuest: true, user: null, session: null, profile: null });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ status: 'unauthenticated', user: null, session: null, profile: null, isGuest: false });
  },

  _setSession: (session) => {
    if (session) {
      set({ status: 'authenticated', user: session.user, session, isGuest: false });
    } else {
      set({ status: 'unauthenticated', user: null, session: null });
    }
  },

  _setProfile: (profile) => set({ profile }),
}));
