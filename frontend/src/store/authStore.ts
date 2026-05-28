import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  _hydrated: boolean;
  appVersion: string;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const APP_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      _hydrated: false,
      appVersion: APP_VERSION,
      setAuth: (user, accessToken) => set({ user, accessToken, appVersion: APP_VERSION }),
      clearAuth: () => set({ user: null, accessToken: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, appVersion: state.appVersion }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          // Check if app version changed, clear auth if so
          if (state.appVersion !== APP_VERSION) {
            state.user = null;
            state.accessToken = null;
            state.appVersion = APP_VERSION;
          }
        }
      },
    }
  )
);
