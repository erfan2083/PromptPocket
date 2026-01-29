import { FolderId } from '@domain/value-objects/FolderId';
import { Tag } from '@domain/value-objects/Tag';
import { PromptId } from '@domain/value-objects/PromptId';
import { IPromptRepository } from '@application/ports/output/IPromptRepository';
import { ISearchIndex } from '@application/ports/output/ISearchIndex';

export interface UpdatePromptRequest {
  id: string;
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface UpdatePromptResponse {
  success: boolean;
  error?: string;
}

export class UpdatePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly searchIndex: ISearchIndex
  ) {}

  async execute(request: UpdatePromptRequest): Promise<UpdatePromptResponse> {
    try {
      const promptId = new PromptId(request.id);
      const existing = await this.promptRepository.findById(promptId);

      if (!existing) {
        return { success: false, error: 'Prompt not found' };
      }

      const updated = existing.update({
        title: request.title,
        content: request.content,
        folderId: request.folderId ? new FolderId(request.folderId) : undefined,
        tags: request.tags ? request.tags.map(t => Tag.fromString(t)) : undefined,
      });

      await this.promptRepository.save(updated);
      await this.searchIndex.update(updated);

      return { success: true };
    } catch (error) {
      console.error('UpdatePromptUseCase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prompt',
      };
    }
  }
}
