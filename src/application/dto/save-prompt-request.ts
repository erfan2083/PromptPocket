import { PlatformType } from '@shared/types';

export interface SavePromptRequest {
  content: string;
  title?: string;
  folderId?: string;
  tags?: string[];
  platform: PlatformType;
  url?: string;
  conversationId?: string;
  allowDuplicate?: boolean;
}

export interface SavePromptResponse {
  success: boolean;
  promptId?: string;
  error?: {
    type: 'validation' | 'duplicate' | 'storage' | 'unknown';
    message: string;
  };
}
