import { Prompt } from '@domain/entities/Prompt';
import { PromptId } from '@domain/value-objects/PromptId';
import { SearchOptions } from '@shared/types';

export interface SearchResult {
  prompt: Prompt;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  key: string;
  value: string;
  indices: [number, number][];
}

export interface ISearchIndex {
  add(prompt: Prompt): Promise<void>;
  update(prompt: Prompt): Promise<void>;
  remove(id: PromptId): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  rebuild(prompts: Prompt[]): Promise<void>;
}
