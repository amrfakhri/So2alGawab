import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AVATAR_IMAGES, DEFAULT_AVATAR_INDEX } from '../avatars';

const AVATAR_KEY = '@so2algawab_user_avatar';

interface UserStore {
  avatarIndex: number;
  setAvatar: (index: number) => Promise<void>;
  loadAvatar: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  avatarIndex: DEFAULT_AVATAR_INDEX,

  setAvatar: async (index) => {
    await AsyncStorage.setItem(AVATAR_KEY, String(index));
    set({ avatarIndex: index });
  },

  loadAvatar: async () => {
    try {
      const stored = await AsyncStorage.getItem(AVATAR_KEY);
      if (stored !== null) {
        const parsed = Number(stored);
        // Discard stale values that fall outside the current avatar list
        if (Number.isInteger(parsed) && parsed >= 0 && parsed < AVATAR_IMAGES.length) {
          set({ avatarIndex: parsed });
        } else {
          await AsyncStorage.removeItem(AVATAR_KEY);
        }
      }
    } catch {}
  },
}));
