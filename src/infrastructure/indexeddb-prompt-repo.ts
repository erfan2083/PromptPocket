import { IPromptRepository } from '@application/ports/output/IPromptRepository';
import { Prompt, PromptDTO } from '@domain/entities/Prompt';
import { PromptId } from '@domain/value-objects/PromptId';
import { FolderId } from '@domain/value-objects/FolderId';
import { Tag } from '@domain/value-objects/Tag';
import { IndexedDBService } from '../storage/IndexedDBService';

export class IndexedDBPromptRepository implements IPromptRepository {
  private readonly storeName = 'prompts';

  constructor(private readonly storage: IndexedDBService) {}

  async save(prompt: Prompt): Promise<void> {
    const dto = prompt.toDTO();
    await this.storage.set(this.storeName, dto);
  }

  async findById(id: PromptId): Promise<Prompt | null> {
    const dto = await this.storage.get<PromptDTO>(this.storeName, id.value);
    return dto ? Prompt.reconstitute(dto) : null;
  }

  async findAll(): Promise<Prompt[]> {
    const dtos = await this.storage.getAll<PromptDTO>(this.storeName);
    return dtos.map(dto => Prompt.reconstitute(dto));
  }

  async findByFolderId(folderId: FolderId): Promise<Prompt[]> {
    const all = await this.findAll();
    return all.filter(p => p.folderId.equals(folderId));
  }

  async findByTags(tags: Tag[]): Promise<Prompt[]> {
    const all = await this.findAll();
    return all.filter(prompt =>
      tags.some(tag =>
        prompt.tags.some(t => t.equals(tag))
      )
    );
  }

  async delete(id: PromptId): Promise<void> {
    await this.storage.delete(this.storeName, id.value);
  }

  async exists(id: PromptId): Promise<boolean> {
    const prompt = await this.findById(id);
    return prompt !== null;
  }

  async count(): Promise<number> {
    return await this.storage.count(this.storeName);
  }
}
