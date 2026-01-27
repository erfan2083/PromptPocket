import { Prompt } from '@domain/entities/Prompt';
import { IPromptRepository } from '@application/ports/output/IPromptRepository';

export class GetAllPromptsUseCase {
  constructor(private readonly promptRepository: IPromptRepository) {}

  async execute(): Promise<{ prompts: Prompt[] }> {
    const prompts = await this.promptRepository.findAll();
    
    // Sort by newest first
    prompts.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
    
    return { prompts };
  }
}
