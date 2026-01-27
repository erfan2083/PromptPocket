import { PromptId } from '@domain/value-objects/PromptId';
import { IPromptRepository } from '@application/ports/output/IPromptRepository';
import { ISearchIndex } from '@application/ports/output/ISearchIndex';

export interface DeletePromptResponse {
  success: boolean;
  error?: string;
}

export class DeletePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly searchIndex: ISearchIndex
  ) {}

  async execute(id: string): Promise<DeletePromptResponse> {
    try {
      const promptId = new PromptId(id);

      const exists = await this.promptRepository.exists(promptId);
      if (!exists) {
        return {
          success: false,
          error: 'Prompt not found',
        };
      }

      await this.promptRepository.delete(promptId);
      await this.searchIndex.remove(promptId);

      return { success: true };
    } catch (error) {
      console.error('DeletePromptUseCase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete prompt',
      };
    }
  }
}
