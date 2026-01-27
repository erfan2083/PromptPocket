import { Prompt } from '@domain/entities/Prompt';
import { FolderId } from '@domain/value-objects/FolderId';
import { Tag } from '@domain/value-objects/Tag';
import { IPromptRepository } from '@application/ports/output/IPromptRepository';
import { ISearchIndex } from '@application/ports/output/ISearchIndex';
import { SavePromptRequest, SavePromptResponse } from '@application/dto/SavePromptRequest';

export class SavePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly searchIndex: ISearchIndex
  ) {}

  async execute(request: SavePromptRequest): Promise<SavePromptResponse> {
    try {
      // Validate
      this.validate(request);

      // Create domain entity
      const folderId = request.folderId 
        ? new FolderId(request.folderId) 
        : FolderId.default();

      const tags = request.tags?.map(t => Tag.fromString(t)) || [];

      const prompt = Prompt.create({
        content: request.content,
        title: request.title,
        folderId,
        tags,
        platform: request.platform || 'unknown',
        url: request.url,
        conversationId: request.conversationId
      });

      // Check duplicate
      if (!request.allowDuplicate) {
        const isDuplicate = await this.checkDuplicate(prompt);
        if (isDuplicate) {
          return {
            success: false,
            error: {
              type: 'duplicate',
              message: 'A prompt with this content already exists'
            }
          };
        }
      }

      // Save
      await this.promptRepository.save(prompt);

      // Update search index
      await this.searchIndex.add(prompt);

      return {
        success: true,
        promptId: prompt.id.value
      };

    } catch (error) {
      console.error('SavePromptUseCase error:', error);
      
      return {
        success: false,
        error: {
          type: error instanceof Error && error.message.includes('validation') 
            ? 'validation' 
            : 'unknown',
          message: error instanceof Error ? error.message : 'Failed to save prompt'
        }
      };
    }
  }

  private validate(request: SavePromptRequest): void {
    if (!request.content || request.content.trim().length === 0) {
      throw new Error('validation: Content cannot be empty');
    }

    if (request.content.length > 10000) {
      throw new Error('validation: Content exceeds maximum length');
    }

    if (request.tags && request.tags.length > 20) {
      throw new Error('validation: Too many tags (maximum 20)');
    }
  }

  private async checkDuplicate(prompt: Prompt): Promise<boolean> {
    const existing = await this.promptRepository.findAll();
    const normalizedContent = prompt.content.trim().toLowerCase();
    
    return existing.some(p => 
      p.content.trim().toLowerCase() === normalizedContent
    );
  }
}
