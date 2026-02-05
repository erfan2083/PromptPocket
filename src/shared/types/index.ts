// Platform Types
export type PlatformType = 'chatgpt' | 'claude' | 'gemini' | 'unknown';

// Message Types (Extension Communication)
export type MessageType =
  | 'SAVE_PROMPT'
  | 'GET_PROMPTS'
  | 'GET_PROMPT'
  | 'UPDATE_PROMPT'
  | 'DELETE_PROMPT'
  | 'SEARCH_PROMPTS'
  | 'INSERT_PROMPT'
  | 'GET_FOLDERS'
  | 'CREATE_FOLDER'
  | 'UPDATE_FOLDER'
  | 'DELETE_FOLDER'
  | 'SYNC_SIGN_IN'
  | 'SYNC_SIGN_OUT'
  | 'SYNC_NOW'
  | 'SYNC_STATUS';

export interface ExtensionMessage<T = any> {
  type: MessageType;
  payload: T;
  requestId?: string;
}

export interface ExtensionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

// Search Types
export interface SearchFilters {
  folderIds?: string[];
  tags?: string[];
  platform?: PlatformType;
  dateFrom?: number;
  dateTo?: number;
}

export interface SearchSort {
  field: 'createdAt' | 'updatedAt' | 'usedCount' | 'title';
  order: 'asc' | 'desc';
}

export interface SearchOptions {
  filters?: SearchFilters;
  sort?: SearchSort;
  pagination?: {
    page: number;
    limit: number;
  };
}

// Settings Types
export interface Settings {
  defaultFolderId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  quickSaveEnabled: boolean;
  showNotifications: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultFolderId: 'default',
  theme: 'system',
  language: 'en',
  quickSaveEnabled: true,
  showNotifications: true
};

// Platform Adapter Types
export interface PlatformSelectors {
  messagesContainer: string;
  userMessage: string;
  assistantMessage: string;
  messageText: string;
  inputBox: string;
}
