export type PlatformType = 'chatgpt' | 'claude' | 'gemini' | 'mobile' | 'unknown';

export interface PromptMetadataDTO {
  createdAt: number;
  updatedAt: number;
  source: {
    platform: PlatformType;
    url?: string;
    conversationId?: string;
  };
}

export interface PromptStatsDTO {
  usedCount: number;
  lastUsedAt: number;
}

export interface PromptDTO {
  id: string;
  title: string;
  content: string;
  folderId: string;
  tags: string[];
  metadata: PromptMetadataDTO;
  stats: PromptStatsDTO;
}

export interface FolderDTO {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: number;
}
