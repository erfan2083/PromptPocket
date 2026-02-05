/**
 * Firebase Configuration - loaded from environment variables.
 *
 * Create a `.env` file in the project root with your Firebase config.
 * See `.env.example` for the required variables.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const googleClientId: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.projectId !== '' &&
    firebaseConfig.appId !== ''
  );
}
