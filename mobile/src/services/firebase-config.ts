/**
 * Firebase Configuration for Mobile App
 *
 * IMPORTANT: Use the SAME Firebase project as the Chrome extension.
 * This ensures prompts sync between both platforms.
 *
 * Setup:
 * 1. Go to your Firebase project → Project Settings → General
 * 2. Add a new app (Web or React Native)
 * 3. Copy the config values below
 */

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.projectId !== '' &&
    firebaseConfig.appId !== ''
  );
}
