import { PromptId } from '../value-objects/PromptId';
import { FolderId } from '../value-objects/FolderId';
import { Tag } from '../value-objects/Tag';
import { PromptMetadata, PromptMetadataDTO } from '../value-objects/PromptMetadata';
import { PromptStats, PromptStatsDTO } from '../value-objects/PromptStats';
import { PlatformType } from '@shared/types';

export interface CreatePromptData {
  content: string;
  title?: string;
  folderId: FolderId;
  tags?: Tag[];
  platform: PlatformType;
  url?: string;
  conversationId?: string;
}

export interface PromptUpdateData {
  title?: string;
  content?: string;
  folderId?: FolderId;
  tags?: Tag[];
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

export class Prompt {
  private constructor(
    public readonly id: PromptId,
    public readonly title: string,
    public readonly content: string,
    public readonly folderId: FolderId,
    public readonly tags: ReadonlyArray<Tag>,
    public readonly metadata: PromptMetadata,
    public readonly stats: PromptStats
  ) {
    this.validate();
    Object.freeze(this);
  }

  static create(data: CreatePromptData): Prompt {
    const id = PromptId.generate();
    const title = data.title || this.generateTitle(data.content);
    const metadata = PromptMetadata.create(data.platform, data.url, data.conversationId);
    const stats = PromptStats.initial();

    return new Prompt(
      id,
      title,
      data.content,
      data.folderId,
      data.tags || [],
      metadata,
      stats
    );
  }

  static reconstitute(dto: PromptDTO): Prompt {
    return new Prompt(
      new PromptId(dto.id),
      dto.title,
      dto.content,
      new FolderId(dto.folderId),
      dto.tags.map(t => Tag.fromString(t)),
      PromptMetadata.reconstitute(dto.metadata),
      PromptStats.reconstitute(dto.stats)
    );
  }

  update(changes: PromptUpdateData): Prompt {
    return new Prompt(
      this.id,
      changes.title ?? this.title,
      changes.content ?? this.content,
      changes.folderId ?? this.folderId,
      changes.tags ?? this.tags,
      this.metadata.markUpdated(),
      this.stats
    );
  }

  incrementUsage(): Prompt {
    return new Prompt(
      this.id,
      this.title,
      this.content,
      this.folderId,
      this.tags,
      this.metadata,
      this.stats.increment()
    );
  }

  private validate(): void {
    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Prompt content cannot be empty');
    }
    
    if (this.content.length > 10000) {
      throw new Error('Prompt content exceeds maximum length (10000 characters)');
    }
    
    if (this.tags.length > 20) {
      throw new Error('Too many tags (maximum 20)');
    }

    if (this.title.length > 200) {
      throw new Error('Title too long (maximum 200 characters)');
    }
  }

  private static generateTitle(content: string): string {
    const maxLength = 60;
    const cleaned = content.trim().replace(/\s+/g, ' ');
    return cleaned.length > maxLength 
      ? cleaned.substring(0, maxLength) + '...'
      : cleaned;
  }

  toDTO(): PromptDTO {
    return {
      id: this.id.value,
      title: this.title,
      content: this.content,
      folderId: this.folderId.value,
      tags: this.tags.map(t => t.value),
      metadata: this.metadata.toDTO(),
      stats: this.stats.toDTO()
    };
  }
}
