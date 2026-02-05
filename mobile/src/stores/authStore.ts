import { create } from 'zustand';
import * as firebase from '../services/firebase';

interface AuthStore {
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  email: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await firebase.signIn(email, password);
      set({ isAuthenticated: true, email, isLoading: false, error: null });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      let message = 'Sign in failed';
      if (
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email or password';
      } else if (firebaseError.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signInWithGoogle: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await firebase.signInWithGoogle(idToken);
      set({
        isAuthenticated: true,
        email: user.email,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign in failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signOut: async () => {
    try {
      await firebase.signOut();
      set({ isAuthenticated: false, email: null, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign out failed',
      });
    }
  },
}));
