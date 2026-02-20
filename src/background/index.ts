import { getContainer, setupDI } from '@infrastructure/di';
import { SavePromptUseCase } from '@application/use-cases/SavePromptUseCase';
import { GetAllPromptsUseCase } from '@application/use-cases/GetAllPromptsUseCase';
import { SearchPromptsUseCase } from '@application/use-cases/SearchPromptsUseCase';
import { DeletePromptUseCase } from '@application/use-cases/DeletePromptUseCase';
import { UpdatePromptUseCase } from '@application/use-cases/UpdatePromptUseCase';
import { SyncPromptsUseCase } from '@application/use-cases/SyncPromptsUseCase';
import { FirebaseSyncService } from '@infrastructure/sync/FirebaseSyncService';
import { ExtensionMessage, ExtensionResponse } from '@shared/types';

console.log('[PromptPocket] Background script loaded');

// Initialize DI container
let isInitialized = false;
let realtimeUnsubscribe: (() => void) | null = null;

async function initialize() {
  if (isInitialized) return;

  try {
    const container = getContainer();
    await setupDI(container);
    isInitialized = true;
    console.log('[PromptPocket] Background initialized');

    // Try to restore sync session from persisted state
    await restoreSyncSession();
  } catch (error) {
    console.error('[PromptPocket] Initialization error:', error);
  }
}

/**
 * Attempt to restore a previous sync session on startup.
 * Checks chrome.storage.local for a persisted sync flag, then
 * re-initializes Firebase and restores the auth session.
 */
async function restoreSyncSession() {
  try {
    const stored = await chrome.storage.local.get(['syncEnabled', 'syncEmail']);
    if (!stored.syncEnabled) return;

    const container = getContainer();
    const syncService = container.resolve<FirebaseSyncService>('ISyncService');
    const restored = await syncService.restore();

    if (restored) {
      console.log('[PromptPocket] Sync session restored, starting full sync and listeners');
      // Perform a full sync to catch up on any changes while offline
      const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
      const syncResult = await syncUseCase.execute();
      if (syncResult.success) {
        chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
      }
      // Start real-time listeners
      startRealtimeListeners();
    } else {
      // Firebase couldn't restore the session - clear the persisted state
      await chrome.storage.local.remove(['syncEnabled', 'syncEmail']);
    }
  } catch (error) {
    console.error('[PromptPocket] Failed to restore sync session:', error);
  }
}

/**
 * Start real-time Firestore listeners that sync remote changes
 * (add, modify, delete) back into local IndexedDB.
 */
function startRealtimeListeners() {
  // Clean up any existing listeners first
  if (realtimeUnsubscribe) {
    realtimeUnsubscribe();
    realtimeUnsubscribe = null;
  }

  try {
    const container = getContainer();
    const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
    realtimeUnsubscribe = syncUseCase.startRealtimeSync(() => {
      // Notify side panel that prompts changed (from a remote device)
      chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
    });
    console.log('[PromptPocket] Real-time sync listeners started');
  } catch (error) {
    console.error('[PromptPocket] Failed to start real-time listeners:', error);
  }
}

/**
 * Stop real-time Firestore listeners.
 */
function stopRealtimeListeners() {
  if (realtimeUnsubscribe) {
    realtimeUnsubscribe();
    realtimeUnsubscribe = null;
    console.log('[PromptPocket] Real-time sync listeners stopped');
  }
}

// Initialize on startup
initialize();

// Handle messages from content script and side panel
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender,
  sendResponse: (response: ExtensionResponse) => void
) => {
  handleMessage(message)
    .then(response => sendResponse(response))
    .catch(error => {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: message.requestId
      });
    });

  return true; // Keep message channel open for async response
});

async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
  if (!isInitialized) {
    await initialize();
  }

  const container = getContainer();

  switch (message.type) {
    case 'SAVE_PROMPT': {
      const useCase = container.resolve<SavePromptUseCase>('SavePromptUseCase');
      const result = await useCase.execute(message.payload);
      if (result.success) {
        chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
        // Push to cloud sync if enabled
        // Fire-and-forget: sync errors must never block or delay the save response
        (async () => {
          try {
            const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
            if (result.promptId) {
              const getAllUseCase = container.resolve<GetAllPromptsUseCase>('GetAllPromptsUseCase');
              const allResult = await getAllUseCase.execute();
              const saved = allResult.prompts.find((p) => p.id.value === result.promptId);
              if (saved) {
                await syncUseCase.pushPrompt(saved.toDTO());
              }
            }
          } catch {
            // Sync errors are intentionally ignored
          }
        })();
      }
      return {
        success: result.success,
        data: result.promptId,
        error: result.error?.message,
        requestId: message.requestId
      };
    }

    case 'GET_PROMPTS': {
      const useCase = container.resolve<GetAllPromptsUseCase>('GetAllPromptsUseCase');
      const result = await useCase.execute();
      return {
        success: true,
        data: result.prompts.map(p => p.toDTO()),
        requestId: message.requestId
      };
    }

    case 'SEARCH_PROMPTS': {
      const useCase = container.resolve<SearchPromptsUseCase>('SearchPromptsUseCase');
      const result = await useCase.execute(message.payload);
      return {
        success: result.success,
        data: {
          prompts: result.prompts.map(p => p.toDTO()),
          total: result.total,
          page: result.page,
          hasMore: result.hasMore
        },
        error: result.error,
        requestId: message.requestId
      };
    }

    case 'UPDATE_PROMPT': {
      const updateUseCase = container.resolve<UpdatePromptUseCase>('UpdatePromptUseCase');
      const updateResult = await updateUseCase.execute(message.payload);
      if (updateResult.success) {
        chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
        // Fire-and-forget: sync errors must never block or delay the update response
        (async () => {
          try {
            const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
            const getAllUseCase = container.resolve<GetAllPromptsUseCase>('GetAllPromptsUseCase');
            const allResult = await getAllUseCase.execute();
            const updated = allResult.prompts.find((p) => p.id.value === message.payload.id);
            if (updated) {
              await syncUseCase.pushPrompt(updated.toDTO());
            }
          } catch {
            // Sync errors are intentionally ignored
          }
        })();
      }
      return {
        success: updateResult.success,
        error: updateResult.error,
        requestId: message.requestId
      };
    }

    case 'DELETE_PROMPT': {
      const useCase = container.resolve<DeletePromptUseCase>('DeletePromptUseCase');
      const result = await useCase.execute(message.payload.id);
      if (result.success) {
        chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
        // Fire-and-forget: sync errors must never block or delay the delete response
        (async () => {
          try {
            const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
            await syncUseCase.removePrompt(message.payload.id);
          } catch {
            // Sync errors are intentionally ignored
          }
        })();
      }
      return {
        success: result.success,
        error: result.error,
        requestId: message.requestId
      };
    }

    case 'SYNC_SIGN_IN': {
      const syncService = container.resolve<FirebaseSyncService>('ISyncService');
      try {
        await syncService.initialize(message.payload.email);
        await syncService.signIn(message.payload.email, message.payload.password);

        // Perform initial full sync
        const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
        const syncResult = await syncUseCase.execute();

        if (syncResult.success) {
          chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
        }

        // Start real-time listeners for bidirectional sync
        startRealtimeListeners();

        return {
          success: true,
          data: { syncResult: syncResult.result, status: syncService.getStatus() },
          requestId: message.requestId,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Sign in failed',
          requestId: message.requestId,
        };
      }
    }

    case 'SYNC_GOOGLE_SIGN_IN': {
      const syncService = container.resolve<FirebaseSyncService>('ISyncService');
      try {
        await syncService.initialize('google');
        await syncService.signInWithGoogle();

        const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
        const syncResult = await syncUseCase.execute();

        if (syncResult.success) {
          chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
        }

        // Start real-time listeners for bidirectional sync
        startRealtimeListeners();

        return {
          success: true,
          data: {
            email: syncService.getUserEmail(),
            syncResult: syncResult.result,
            status: syncService.getStatus(),
          },
          requestId: message.requestId,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Google sign in failed',
          requestId: message.requestId,
        };
      }
    }

    case 'SYNC_SIGN_OUT': {
      const syncService = container.resolve<FirebaseSyncService>('ISyncService');
      stopRealtimeListeners();
      await syncService.disconnect();
      return {
        success: true,
        requestId: message.requestId,
      };
    }

    case 'SYNC_NOW': {
      const syncUseCase = container.resolve<SyncPromptsUseCase>('SyncPromptsUseCase');
      const syncResult = await syncUseCase.execute();
      if (syncResult.success) {
        chrome.runtime.sendMessage({ type: 'PROMPTS_UPDATED' }).catch(() => {});
      }
      return {
        success: syncResult.success,
        data: syncResult.result,
        error: syncResult.error,
        requestId: message.requestId,
      };
    }

    case 'SYNC_STATUS': {
      const syncService = container.resolve<FirebaseSyncService>('ISyncService');
      const status = syncService.getStatus();
      return {
        success: true,
        data: {
          ...status,
          email: syncService.getUserEmail(),
        },
        requestId: message.requestId,
      };
    }

    default:
      return {
        success: false,
        error: `Unknown message type: ${message.type}`,
        requestId: message.requestId
      };
  }
}

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

console.log('[PromptPocket] Background script ready');
