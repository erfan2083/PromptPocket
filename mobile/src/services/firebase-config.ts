/**
 * Firebase Configuration for Mobile App - loaded from environment variables.
 *
 * Create a `.env` file in the mobile/ directory with your Firebase config.
 * See `.env.example` for the required variables.
 *
 * IMPORTANT: Use the SAME Firebase project as the Chrome extension.
 */

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const googleClientId: string = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
export const googleAndroidClientId: string =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
export const googleIosClientId: string = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.projectId !== '' &&
    firebaseConfig.appId !== ''
  );
}
