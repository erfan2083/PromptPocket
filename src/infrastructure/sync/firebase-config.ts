/**
 * Firebase Configuration
 *
 * To enable cloud sync between the extension and mobile app:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firestore Database (start in test mode or configure rules)
 * 3. Enable Authentication → Email/Password provider
 * 4. Copy your web app config below
 *
 * Firestore Security Rules (recommended):
 * ```
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{userId}/{document=**} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *   }
 * }
 * ```
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Replace with your Firebase project configuration
export const firebaseConfig: FirebaseConfig = {
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
