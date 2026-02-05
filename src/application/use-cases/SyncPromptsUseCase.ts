import { Prompt, PromptDTO } from '@domain/entities/Prompt';
import { Folder, FolderDTO } from '@domain/entities/Folder';
import { PromptId } from '@domain/value-objects/PromptId';
import { FolderId } from '@domain/value-objects/FolderId';
import { IPromptRepository } from '@application/ports/output/IPromptRepository';
import { IFolderRepository } from '@application/ports/output/IFolderRepository';
import { ISearchIndex } from '@application/ports/output/ISearchIndex';
import { ISyncService, SyncResult, SyncStatus } from '@application/ports/output/ISyncService';

export interface SyncResponse {
  success: boolean;
  result?: SyncResult;
  error?: string;
}

export class SyncPromptsUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly folderRepository: IFolderRepository,
    private readonly searchIndex: ISearchIndex,
    private readonly syncService: ISyncService
  ) {}

  /** Full bidirectional sync */
  async execute(): Promise<SyncResponse> {
    if (!this.syncService.isEnabled()) {
      return { success: false, error: 'Sync is not enabled. Please sign in first.' };
    }

    try {
      // Get all local data as DTOs
      const localPrompts = await this.promptRepository.findAll();
      const localFolders = await this.folderRepository.findAll();
      const localPromptDTOs = localPrompts.map((p) => p.toDTO());
      const localFolderDTOs = localFolders.map((f) => f.toDTO());

      // Perform full sync
      const result = await this.syncService.fullSync(localPromptDTOs, localFolderDTOs);

      // Pull remote data that's newer or missing locally
      const remotePrompts = await this.syncService.pullPrompts();
      const remoteFolders = await this.syncService.pullFolders();

      // Merge remote prompts into local
      const localPromptMap = new Map(localPromptDTOs.map((p) => [p.id, p]));
      for (const remote of remotePrompts) {
        const local = localPromptMap.get(remote.id);
        if (!local || remote.metadata.updatedAt > local.metadata.updatedAt) {
          const prompt = Prompt.reconstitute(remote);
          await this.promptRepository.save(prompt);
          await this.searchIndex.add(prompt);
        }
      }

      // Merge remote folders into local
      const localFolderMap = new Map(localFolderDTOs.map((f) => [f.id, f]));
      for (const remote of remoteFolders) {
        if (!localFolderMap.has(remote.id)) {
          const folder = Folder.reconstitute(remote);
          await this.folderRepository.save(folder);
        }
      }

      return { success: true, result };
    } catch (error) {
      console.error('SyncPromptsUseCase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      };
    }
  }

  /** Push a single prompt to the cloud after local save */
  async pushPrompt(promptDTO: PromptDTO): Promise<void> {
    if (this.syncService.isEnabled()) {
      try {
        await this.syncService.pushPrompt(promptDTO);
      } catch (error) {
        console.error('[Sync] Failed to push prompt:', error);
      }
    }
  }

  /** Push a single folder to the cloud after local save */
  async pushFolder(folderDTO: FolderDTO): Promise<void> {
    if (this.syncService.isEnabled()) {
      try {
        await this.syncService.pushFolder(folderDTO);
      } catch (error) {
        console.error('[Sync] Failed to push folder:', error);
      }
    }
  }

  /** Remove a prompt from the cloud after local delete */
  async removePrompt(promptId: string): Promise<void> {
    if (this.syncService.isEnabled()) {
      try {
        await this.syncService.deletePrompt(promptId);
      } catch (error) {
        console.error('[Sync] Failed to delete remote prompt:', error);
      }
    }
  }

  /** Get current sync status */
  getStatus(): SyncStatus {
    return this.syncService.getStatus();
  }

  /** Start listening for remote changes */
  startRealtimeSync(onUpdate: () => void): () => void {
    if (!this.syncService.isEnabled()) return () => {};

    return this.syncService.onRemoteChange(async (type, action, data) => {
      try {
        if (type === 'prompt') {
          if (action === 'removed' && typeof data === 'string') {
            const id = new PromptId(data);
            await this.promptRepository.delete(id);
            await this.searchIndex.remove(id);
          } else if (typeof data === 'object' && 'content' in data) {
            // A prompt was added or modified remotely
            const prompt = Prompt.reconstitute(data as PromptDTO);
            await this.promptRepository.save(prompt);
            await this.searchIndex.add(prompt);
          }
        } else if (type === 'folder') {
          if (action === 'removed' && typeof data === 'string') {
            await this.folderRepository.delete(new FolderId(data));
          } else if (typeof data === 'object' && 'name' in data) {
            const folder = Folder.reconstitute(data as FolderDTO);
            await this.folderRepository.save(folder);
          }
        }
        onUpdate();
      } catch (error) {
        console.error('[Sync] Error handling remote change:', error);
      }
    });
  }
}
