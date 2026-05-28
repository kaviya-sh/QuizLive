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
  loginTime: number | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  checkSessionExpiry: () => boolean;
}

const APP_VERSION = import.meta.env.VITE_APP_VERSION || Date.now().toString();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      _hydrated: false,
      appVersion: APP_VERSION,
      loginTime: null,
      setAuth: (user, accessToken) => set({ user, accessToken, appVersion: APP_VERSION, loginTime: Date.now() }),
      clearAuth: () => set({ user: null, accessToken: null, loginTime: null }),
      isAuthenticated: () => {
        const state = get();
        if (!state.accessToken) return false;
        
        // Check if session expired
        if (state.loginTime && Date.now() - state.loginTime > SESSION_DURATION) {
          return false;
        }
        return true;
      },
      checkSessionExpiry: () => {
        const state = get();
        if (state.loginTime && Date.now() - state.loginTime > SESSION_DURATION) {
          set({ user: null, accessToken: null, loginTime: null });
          return true; // Session expired
        }
        return false; // Session valid
      },
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, appVersion: state.appVersion, loginTime: state.loginTime }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          // Check if app version changed, clear auth if so
          if (state.appVersion !== APP_VERSION) {
            state.user = null;
            state.accessToken = null;
            state.appVersion = APP_VERSION;
            state.loginTime = null;
          }
          // Check if session expired
          if (state.loginTime && Date.now() - state.loginTime > SESSION_DURATION) {
            state.user = null;
            state.accessToken = null;
            state.loginTime = null;
          }
        }
      },
    }
  )
);
