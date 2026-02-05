import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { PromptDTO, FolderDTO } from '../types';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let currentUser: User | null = null;
const activeListeners: Unsubscribe[] = [];

export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please update firebase-config.ts');
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });

    onAuthStateChanged(auth, (user) => {
      currentUser = user;
    });
  }

  return { app, db: db!, auth: auth! };
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase();
  return auth!;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

function getUserId(): string {
  if (!currentUser) throw new Error('Not authenticated');
  return currentUser.uid;
}

function getPromptsCollection() {
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, 'users', getUserId(), 'prompts');
}

function getFoldersCollection() {
  if (!db) throw new Error('Firebase not initialized');
  return collection(db, 'users', getUserId(), 'folders');
}

// Auth operations
export async function signIn(email: string, password: string): Promise<User> {
  const { auth: firebaseAuth } = initializeFirebase();
  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    currentUser = credential.user;
    return credential.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      currentUser = credential.user;
      return credential.user;
    }
    throw error;
  }
}

export async function signInWithGoogle(idToken: string): Promise<User> {
  const { auth: firebaseAuth } = initializeFirebase();
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(firebaseAuth, credential);
  currentUser = result.user;
  return result.user;
}

export async function signOut(): Promise<void> {
  activeListeners.forEach((unsub) => unsub());
  activeListeners.length = 0;

  if (auth) {
    await firebaseSignOut(auth);
  }
  currentUser = null;
}

// Prompt CRUD
export async function pushPrompt(prompt: PromptDTO): Promise<void> {
  const ref = doc(getPromptsCollection(), prompt.id);
  await setDoc(ref, prompt);
}

export async function deletePrompt(promptId: string): Promise<void> {
  const ref = doc(getPromptsCollection(), promptId);
  await deleteDoc(ref);
}

export async function getAllPrompts(): Promise<PromptDTO[]> {
  const q = query(getPromptsCollection());
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as PromptDTO);
}

// Folder CRUD
export async function pushFolder(folder: FolderDTO): Promise<void> {
  const ref = doc(getFoldersCollection(), folder.id);
  await setDoc(ref, folder);
}

export async function deleteFolder(folderId: string): Promise<void> {
  const ref = doc(getFoldersCollection(), folderId);
  await deleteDoc(ref);
}

export async function getAllFolders(): Promise<FolderDTO[]> {
  const q = query(getFoldersCollection());
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as FolderDTO);
}

// Real-time listeners
export function onPromptsChange(
  callback: (prompts: PromptDTO[]) => void
): Unsubscribe {
  const unsub = onSnapshot(query(getPromptsCollection()), (snapshot) => {
    const prompts = snapshot.docs.map((d) => d.data() as PromptDTO);
    callback(prompts);
  });
  activeListeners.push(unsub);
  return unsub;
}

export function onFoldersChange(
  callback: (folders: FolderDTO[]) => void
): Unsubscribe {
  const unsub = onSnapshot(query(getFoldersCollection()), (snapshot) => {
    const folders = snapshot.docs.map((d) => d.data() as FolderDTO);
    callback(folders);
  });
  activeListeners.push(unsub);
  return unsub;
}
