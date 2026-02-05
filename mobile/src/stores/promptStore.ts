import { create } from 'zustand';
import { PromptDTO } from '../types';
import * as firebase from '../services/firebase';

interface PromptStore {
  prompts: PromptDTO[];
  isLoading: boolean;
  error: string | null;

  loadPrompts: () => Promise<void>;
  savePrompt: (prompt: PromptDTO) => Promise<void>;
  updatePrompt: (prompt: PromptDTO) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  setPrompts: (prompts: PromptDTO[]) => void;

  getPromptById: (id: string) => PromptDTO | undefined;
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  isLoading: false,
  error: null,

  loadPrompts: async () => {
    set({ isLoading: true, error: null });
    try {
      const prompts = await firebase.getAllPrompts();
      prompts.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
      set({ prompts, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load prompts',
        isLoading: false,
      });
    }
  },

  savePrompt: async (prompt: PromptDTO) => {
    try {
      await firebase.pushPrompt(prompt);
      set((state) => ({
        prompts: [prompt, ...state.prompts],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save prompt',
      });
      throw error;
    }
  },

  updatePrompt: async (prompt: PromptDTO) => {
    try {
      await firebase.pushPrompt(prompt);
      set((state) => ({
        prompts: state.prompts.map((p) => (p.id === prompt.id ? prompt : p)),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update prompt',
      });
      throw error;
    }
  },

  deletePrompt: async (id: string) => {
    try {
      await firebase.deletePrompt(id);
      set((state) => ({
        prompts: state.prompts.filter((p) => p.id !== id),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete prompt',
      });
      throw error;
    }
  },

  setPrompts: (prompts: PromptDTO[]) => {
    prompts.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
    set({ prompts });
  },

  getPromptById: (id: string) => {
    return get().prompts.find((p) => p.id === id);
  },
}));
