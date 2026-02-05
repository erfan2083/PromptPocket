import { DIContainer } from './Container';
import { IndexedDBService } from '../storage/IndexedDBService';
import { IndexedDBPromptRepository } from '../repositories/IndexedDBPromptRepository';
import { IndexedDBFolderRepository } from '../repositories/IndexedDBFolderRepository';
import { FuseSearchEngine } from '../search/FuseSearchEngine';
import { AdapterRegistry } from '../platform-adapters/base/AdapterRegistry';
import { ChatGPTAdapter } from '../platform-adapters/chatgpt/ChatGPTAdapter';
import { GeminiAdapter } from '../platform-adapters/gemini/GeminiAdapter';
import { FirebaseSyncService } from '../sync/FirebaseSyncService';
import { SavePromptUseCase } from '@application/use-cases/SavePromptUseCase';
import { GetAllPromptsUseCase } from '@application/use-cases/GetAllPromptsUseCase';
import { SearchPromptsUseCase } from '@application/use-cases/SearchPromptsUseCase';
import { DeletePromptUseCase } from '@application/use-cases/DeletePromptUseCase';
import { UpdatePromptUseCase } from '@application/use-cases/UpdatePromptUseCase';
import { SyncPromptsUseCase } from '@application/use-cases/SyncPromptsUseCase';

export async function setupDI(container: DIContainer): Promise<void> {
  // Storage layer
  container.registerSingleton('IndexedDBService', () => new IndexedDBService());

  // Initialize storage
  const storage = container.resolve<IndexedDBService>('IndexedDBService');
  await storage.init();

  // Repositories
  container.registerSingleton('IPromptRepository', () =>
    new IndexedDBPromptRepository(container.resolve('IndexedDBService'))
  );

  container.registerSingleton('IFolderRepository', () =>
    new IndexedDBFolderRepository(container.resolve('IndexedDBService'))
  );

  // Search
  container.registerSingleton('ISearchIndex', () => new FuseSearchEngine());

  // Platform adapters
  container.registerSingleton('AdapterRegistry', () => {
    const registry = new AdapterRegistry();
    registry.register(new ChatGPTAdapter());
    registry.register(new GeminiAdapter());
    // Future: registry.register(new ClaudeAdapter());
    return registry;
  });

  // Sync service
  container.registerSingleton('ISyncService', () => new FirebaseSyncService());

  // Use cases
  container.register('SavePromptUseCase', () =>
    new SavePromptUseCase(
      container.resolve('IPromptRepository'),
      container.resolve('ISearchIndex')
    )
  );

  container.register('GetAllPromptsUseCase', () =>
    new GetAllPromptsUseCase(
      container.resolve('IPromptRepository')
    )
  );

  container.register('SearchPromptsUseCase', () =>
    new SearchPromptsUseCase(
      container.resolve('ISearchIndex'),
      container.resolve('IPromptRepository')
    )
  );

  container.register('DeletePromptUseCase', () =>
    new DeletePromptUseCase(
      container.resolve('IPromptRepository'),
      container.resolve('ISearchIndex')
    )
  );

  container.register('UpdatePromptUseCase', () =>
    new UpdatePromptUseCase(
      container.resolve('IPromptRepository'),
      container.resolve('ISearchIndex')
    )
  );

  container.register('SyncPromptsUseCase', () =>
    new SyncPromptsUseCase(
      container.resolve('IPromptRepository'),
      container.resolve('IFolderRepository'),
      container.resolve('ISearchIndex'),
      container.resolve('ISyncService')
    )
  );

  console.log('[PromptPocket] DI Container initialized');
}
