import { PromptDTO } from '@domain/entities/Prompt';
import { FolderDTO } from '@domain/entities/Folder';

export interface SyncResult {
  pushed: number;
  pulled: number;
  deleted: number;
  errors: string[];
}

export interface SyncStatus {
  enabled: boolean;
  lastSyncAt: number | null;
  isSyncing: boolean;
  error: string | null;
}

export interface ISyncService {
  /** Initialize connection and authenticate */
  initialize(userId: string): Promise<void>;

  /** Check if sync is currently enabled and authenticated */
  isEnabled(): boolean;

  /** Get current sync status */
  getStatus(): SyncStatus;

  /** Push a single prompt to the cloud */
  pushPrompt(prompt: PromptDTO): Promise<void>;

  /** Push a single folder to the cloud */
  pushFolder(folder: FolderDTO): Promise<void>;

  /** Delete a prompt from the cloud */
  deletePrompt(promptId: string): Promise<void>;

  /** Delete a folder from the cloud */
  deleteFolder(folderId: string): Promise<void>;

  /** Pull all prompts from the cloud */
  pullPrompts(): Promise<PromptDTO[]>;

  /** Pull all folders from the cloud */
  pullFolders(): Promise<FolderDTO[]>;

  /** Full sync: merge local and remote data */
  fullSync(
    localPrompts: PromptDTO[],
    localFolders: FolderDTO[]
  ): Promise<SyncResult>;

  /** Subscribe to real-time changes from cloud */
  onRemoteChange(callback: (type: 'prompt' | 'folder', action: 'added' | 'modified' | 'removed', data: PromptDTO | FolderDTO | string) => void): () => void;

  /** Sign out and disable sync */
  disconnect(): Promise<void>;
}
