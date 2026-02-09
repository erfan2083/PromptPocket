import { create } from 'zustand';

interface SyncState {
  isSignedIn: boolean;
  isSyncing: boolean;
  lastSyncAt: number | null;
  error: string | null;
  email: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSignedIn: false,
  isSyncing: false,
  lastSyncAt: null,
  error: null,
  email: null,

  signIn: async (email: string, password: string) => {
    set({ isSyncing: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SYNC_SIGN_IN',
        payload: { email, password },
      });

      if (response.success) {
        set({
          isSignedIn: true,
          isSyncing: false,
          lastSyncAt: Date.now(),
          email,
          error: null,
        });
      } else {
        set({ isSyncing: false, error: response.error || 'Sign in failed' });
      }
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      });
    }
  },

  signInWithGoogle: async () => {
    set({ isSyncing: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SYNC_GOOGLE_SIGN_IN',
        payload: {},
      });

      if (response.success) {
        set({
          isSignedIn: true,
          isSyncing: false,
          lastSyncAt: Date.now(),
          email: response.data?.email || 'Google Account',
          error: null,
        });
      } else {
        set({ isSyncing: false, error: response.error || 'Google sign in failed' });
      }
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Google sign in failed',
      });
    }
  },

  signOut: async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'SYNC_SIGN_OUT',
        payload: {},
      });
      set({
        isSignedIn: false,
        isSyncing: false,
        lastSyncAt: null,
        email: null,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
      });
    }
  },

  syncNow: async () => {
    set({ isSyncing: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SYNC_NOW',
        payload: {},
      });

      if (response.success) {
        set({ isSyncing: false, lastSyncAt: Date.now(), error: null });
      } else {
        set({ isSyncing: false, error: response.error || 'Sync failed' });
      }
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  },

  checkStatus: async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SYNC_STATUS',
        payload: {},
      });

      if (response.success && response.data) {
        set({
          isSignedIn: response.data.enabled,
          isSyncing: response.data.isSyncing,
          lastSyncAt: response.data.lastSyncAt,
          error: response.data.error,
          email: response.data.email || null,
        });
      }
    } catch {
      // Status check failure is non-critical
    }
  },
}));
