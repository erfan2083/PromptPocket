import { PlatformType } from '@shared/types';

export interface PromptMetadataDTO {
  createdAt: number;
  updatedAt: number;
  source: {
    platform: PlatformType;
    url?: string;
    conversationId?: string;
  };
}

export class PromptMetadata {
  private constructor(
    public readonly createdAt: number,
    public readonly updatedAt: number,
    public readonly source: {
      platform: PlatformType;
      url?: string;
      conversationId?: string;
    }
  ) {
    Object.freeze(this);
  }

  static create(platform: PlatformType, url?: string, conversationId?: string): PromptMetadata {
    const now = Date.now();
    return new PromptMetadata(now, now, { platform, url, conversationId });
  }

  static reconstitute(dto: PromptMetadataDTO): PromptMetadata {
    return new PromptMetadata(dto.createdAt, dto.updatedAt, dto.source);
  }

  markUpdated(): PromptMetadata {
    return new PromptMetadata(this.createdAt, Date.now(), this.source);
  }

  toDTO(): PromptMetadataDTO {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      source: { ...this.source }
    };
  }
}
