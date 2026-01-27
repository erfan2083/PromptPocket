import { create } from 'zustand';
import { Prompt } from '@domain/entities/Prompt';
import { getContainer } from '@infrastructure/di';
import { GetAllPromptsUseCase } from '@application/use-cases/GetAllPromptsUseCase';
import { SavePromptUseCase } from '@application/use-cases/SavePromptUseCase';
import { DeletePromptUseCase } from '@application/use-cases/DeletePromptUseCase';
import { SavePromptRequest } from '@application/dto/SavePromptRequest';

interface PromptStore {
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPrompts: () => Promise<void>;
  savePrompt: (data: SavePromptRequest) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  
  // Selectors
  getPromptById: (id: string) => Prompt | undefined;
  getPromptsByFolder: (folderId: string) => Prompt[];
  getPromptsByTags: (tags: string[]) => Prompt[];
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  isLoading: false,
  error: null,

  loadPrompts: async () => {
    set({ isLoading: true, error: null });

    try {
      const container = getContainer();
      const useCase = container.resolve<GetAllPromptsUseCase>('GetAllPromptsUseCase');
      const result = await useCase.execute();

      set({ prompts: result.prompts, isLoading: false });
    } catch (error) {
      console.error('Failed to load prompts:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load prompts',
        isLoading: false 
      });
    }
  },

  savePrompt: async (data: SavePromptRequest) => {
    const container = getContainer();
    const useCase = container.resolve<SavePromptUseCase>('SavePromptUseCase');

    const result = await useCase.execute(data);

    if (result.success) {
      // Reload prompts
      await get().loadPrompts();
    } else {
      throw new Error(result.error?.message || 'Failed to save prompt');
    }
  },

  deletePrompt: async (id: string) => {
    const container = getContainer();
    const useCase = container.resolve<DeletePromptUseCase>('DeletePromptUseCase');
    const result = await useCase.execute(id);

    if (result.success) {
      await get().loadPrompts();
    } else {
      throw new Error(result.error || 'Failed to delete prompt');
    }
  },

  getPromptById: (id: string) => {
    return get().prompts.find(p => p.id.value === id);
  },

  getPromptsByFolder: (folderId: string) => {
    return get().prompts.filter(p => p.folderId.value === folderId);
  },

  getPromptsByTags: (tags: string[]) => {
    return get().prompts.filter(p =>
      tags.some(tag => p.tags.some(t => t.value === tag))
    );
  }
}));
