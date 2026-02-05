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
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { ISyncService, SyncResult, SyncStatus } from '@application/ports/output/ISyncService';
import { PromptDTO } from '@domain/entities/Prompt';
import { FolderDTO } from '@domain/entities/Folder';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config';

export class FirebaseSyncService implements ISyncService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private user: User | null = null;
  private _status: SyncStatus = {
    enabled: false,
    lastSyncAt: null,
    isSyncing: false,
    error: null,
  };
  private unsubscribers: Unsubscribe[] = [];

  async initialize(userId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase is not configured. Please add your Firebase config in firebase-config.ts'
      );
    }

    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);

      // Wait for auth state
      await new Promise<void>((resolve, reject) => {
        if (!this.auth) return reject(new Error('Auth not initialized'));
        const unsub = onAuthStateChanged(this.auth, (user) => {
          this.user = user;
          unsub();
          resolve();
        });
      });

      // If not signed in, store userId for later auth
      if (!this.user) {
        console.log('[PromptPocket Sync] No user signed in. Call signIn() to authenticate.');
      }

      this._status = {
        ...this._status,
        enabled: true,
        error: null,
      };

      // Store userId in chrome storage for persistence
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ syncUserId: userId });
      }
    } catch (error) {
      this._status.error = error instanceof Error ? error.message : 'Failed to initialize sync';
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!this.auth) throw new Error('Sync not initialized');

    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.user = credential.user;
      this._status.enabled = true;
      this._status.error = null;
    } catch (error: unknown) {
      // If user doesn't exist, create account
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        this.user = credential.user;
        this._status.enabled = true;
        this._status.error = null;
      } else {
        throw error;
      }
    }
  }

  isEnabled(): boolean {
    return this._status.enabled && this.user !== null;
  }

  getStatus(): SyncStatus {
    return { ...this._status };
  }

  private getUserId(): string {
    if (!this.user) throw new Error('Not authenticated');
    return this.user.uid;
  }

  private getPromptsCollection() {
    if (!this.db) throw new Error('Firestore not initialized');
    return collection(this.db, 'users', this.getUserId(), 'prompts');
  }

  private getFoldersCollection() {
    if (!this.db) throw new Error('Firestore not initialized');
    return collection(this.db, 'users', this.getUserId(), 'folders');
  }

  async pushPrompt(prompt: PromptDTO): Promise<void> {
    const ref = doc(this.getPromptsCollection(), prompt.id);
    await setDoc(ref, prompt);
  }

  async pushFolder(folder: FolderDTO): Promise<void> {
    const ref = doc(this.getFoldersCollection(), folder.id);
    await setDoc(ref, folder);
  }

  async deletePrompt(promptId: string): Promise<void> {
    const ref = doc(this.getPromptsCollection(), promptId);
    await deleteDoc(ref);
  }

  async deleteFolder(folderId: string): Promise<void> {
    const ref = doc(this.getFoldersCollection(), folderId);
    await deleteDoc(ref);
  }

  async pullPrompts(): Promise<PromptDTO[]> {
    const q = query(this.getPromptsCollection());
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as PromptDTO);
  }

  async pullFolders(): Promise<FolderDTO[]> {
    const q = query(this.getFoldersCollection());
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as FolderDTO);
  }

  async fullSync(localPrompts: PromptDTO[], localFolders: FolderDTO[]): Promise<SyncResult> {
    this._status.isSyncing = true;
    const result: SyncResult = { pushed: 0, pulled: 0, deleted: 0, errors: [] };

    try {
      // Pull remote data
      const remotePrompts = await this.pullPrompts();
      const remoteFolders = await this.pullFolders();

      // Build lookup maps
      const remotePromptMap = new Map(remotePrompts.map((p) => [p.id, p]));
      const localPromptMap = new Map(localPrompts.map((p) => [p.id, p]));
      const remoteFolderMap = new Map(remoteFolders.map((f) => [f.id, f]));
      const localFolderMap = new Map(localFolders.map((f) => [f.id, f]));

      // Sync prompts: push local-only or newer-local to remote
      for (const local of localPrompts) {
        const remote = remotePromptMap.get(local.id);
        if (!remote || local.metadata.updatedAt > remote.metadata.updatedAt) {
          try {
            await this.pushPrompt(local);
            result.pushed++;
          } catch (e) {
            result.errors.push(`Failed to push prompt ${local.id}: ${e}`);
          }
        }
      }

      // Sync prompts: pull remote-only or newer-remote
      for (const remote of remotePrompts) {
        const local = localPromptMap.get(remote.id);
        if (!local || remote.metadata.updatedAt > local.metadata.updatedAt) {
          result.pulled++;
        }
      }

      // Sync folders: push local-only to remote
      for (const local of localFolders) {
        const remote = remoteFolderMap.get(local.id);
        if (!remote || local.createdAt > remote.createdAt) {
          try {
            await this.pushFolder(local);
            result.pushed++;
          } catch (e) {
            result.errors.push(`Failed to push folder ${local.id}: ${e}`);
          }
        }
      }

      // Sync folders: pull remote-only
      for (const remote of remoteFolders) {
        if (!localFolderMap.has(remote.id)) {
          result.pulled++;
        }
      }

      this._status.lastSyncAt = Date.now();
      this._status.error = null;
    } catch (error) {
      this._status.error = error instanceof Error ? error.message : 'Sync failed';
      result.errors.push(this._status.error);
    } finally {
      this._status.isSyncing = false;
    }

    return result;
  }

  onRemoteChange(
    callback: (
      type: 'prompt' | 'folder',
      action: 'added' | 'modified' | 'removed',
      data: PromptDTO | FolderDTO | string
    ) => void
  ): () => void {
    if (!this.isEnabled()) return () => {};

    // Listen to prompts collection
    const promptUnsub = onSnapshot(
      query(this.getPromptsCollection()),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as PromptDTO;
          if (change.type === 'removed') {
            callback('prompt', 'removed', change.doc.id);
          } else {
            callback('prompt', change.type as 'added' | 'modified', data);
          }
        });
      }
    );

    // Listen to folders collection
    const folderUnsub = onSnapshot(
      query(this.getFoldersCollection()),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as FolderDTO;
          if (change.type === 'removed') {
            callback('folder', 'removed', change.doc.id);
          } else {
            callback('folder', change.type as 'added' | 'modified', data);
          }
        });
      }
    );

    this.unsubscribers.push(promptUnsub, folderUnsub);

    return () => {
      promptUnsub();
      folderUnsub();
    };
  }

  async disconnect(): Promise<void> {
    // Unsubscribe all listeners
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    if (this.auth) {
      await signOut(this.auth);
    }

    this.user = null;
    this._status = {
      enabled: false,
      lastSyncAt: null,
      isSyncing: false,
      error: null,
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['syncUserId', 'syncEmail']);
    }
  }
}
