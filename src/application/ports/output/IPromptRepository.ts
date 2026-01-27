import { Prompt } from '@domain/entities/Prompt';
import { PromptId } from '@domain/value-objects/PromptId';
import { FolderId } from '@domain/value-objects/FolderId';
import { Tag } from '@domain/value-objects/Tag';

export interface IPromptRepository {
  save(prompt: Prompt): Promise<void>;
  findById(id: PromptId): Promise<Prompt | null>;
  findAll(): Promise<Prompt[]>;
  findByFolderId(folderId: FolderId): Promise<Prompt[]>;
  findByTags(tags: Tag[]): Promise<Prompt[]>;
  delete(id: PromptId): Promise<void>;
  exists(id: PromptId): Promise<boolean>;
  count(): Promise<number>;
}
