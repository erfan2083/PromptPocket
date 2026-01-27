import { Prompt } from '@domain/entities/Prompt';
import { SearchFilters, SearchSort } from '@shared/types';

export interface SearchPromptsRequest {
  query?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchPromptsResponse {
  success: boolean;
  prompts: Prompt[];
  total: number;
  page: number;
  hasMore: boolean;
  error?: string;
}
