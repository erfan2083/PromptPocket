import { getContainer, setupDI } from '@infrastructure/di';
import { SavePromptUseCase } from '@application/use-cases/SavePromptUseCase';
import { GetAllPromptsUseCase } from '@application/use-cases/GetAllPromptsUseCase';
import { SearchPromptsUseCase } from '@application/use-cases/SearchPromptsUseCase';
import { DeletePromptUseCase } from '@application/use-cases/DeletePromptUseCase';
import { ExtensionMessage, ExtensionResponse } from '@shared/types';

console.log('[PromptPocket] Background script loaded');

// Initialize DI container
let isInitialized = false;

async function initialize() {
  if (isInitialized) return;
  
  try {
    const container = getContainer();
    await setupDI(container);
    isInitialized = true;
    console.log('[PromptPocket] Background initialized');
  } catch (error) {
    console.error('[PromptPocket] Initialization error:', error);
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

    case 'DELETE_PROMPT': {
      const useCase = container.resolve<DeletePromptUseCase>('DeletePromptUseCase');
      const result = await useCase.execute(message.payload.id);
      return {
        success: result.success,
        error: result.error,
        requestId: message.requestId
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
