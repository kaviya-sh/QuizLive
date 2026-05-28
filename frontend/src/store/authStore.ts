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

const APP_VERSION = '1.0.0';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

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
