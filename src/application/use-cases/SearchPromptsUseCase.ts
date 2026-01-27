import { Prompt } from '@domain/entities/Prompt';
import { ISearchIndex } from '@application/ports/output/ISearchIndex';
import { IPromptRepository } from '@application/ports/output/IPromptRepository';
import { SearchPromptsRequest, SearchPromptsResponse } from '@application/dto/SearchPromptsRequest';
import { SearchFilters } from '@shared/types';

export class SearchPromptsUseCase {
  constructor(
    private readonly searchIndex: ISearchIndex,
    private readonly promptRepository: IPromptRepository
  ) {}

  async execute(request: SearchPromptsRequest): Promise<SearchPromptsResponse> {
    try {
      let results: Prompt[];

      // Step 1: Get prompts (search or all)
      if (request.query && request.query.trim().length > 0) {
        const searchResults = await this.searchIndex.search(request.query, {
          filters: request.filters,
          sort: request.sort
        });
        results = searchResults.map(r => r.prompt);
      } else {
        results = await this.promptRepository.findAll();
      }

      // Step 2: Apply additional filters if no search query
      if (!request.query && request.filters) {
        results = this.applyFilters(results, request.filters);
      }

      // Step 3: Sort
      if (request.sort) {
        results = this.sortResults(results, request.sort);
      } else {
        // Default: newest first
        results.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
      }

      // Step 4: Paginate
      const pagination = request.pagination || { page: 1, limit: 50 };
      const { items, hasMore } = this.paginate(results, pagination);

      return {
        success: true,
        prompts: items,
        total: results.length,
        page: pagination.page,
        hasMore
      };

    } catch (error) {
      console.error('SearchPromptsUseCase error:', error);
      
      return {
        success: false,
        prompts: [],
        total: 0,
        page: 1,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  private applyFilters(prompts: Prompt[], filters: SearchFilters): Prompt[] {
    let filtered = prompts;

    if (filters.folderIds && filters.folderIds.length > 0) {
      filtered = filtered.filter(p =>
        filters.folderIds!.includes(p.folderId.value)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p =>
        filters.tags!.every(tag =>
          p.tags.some(t => t.value === tag)
        )
      );
    }

    if (filters.platform) {
      filtered = filtered.filter(p =>
        p.metadata.source.platform === filters.platform
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(p =>
        p.metadata.createdAt >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(p =>
        p.metadata.createdAt <= filters.dateTo!
      );
    }

    return filtered;
  }

  private sortResults(prompts: Prompt[], sort: { field: string; order: 'asc' | 'desc' }): Prompt[] {
    const { field, order } = sort;
    const multiplier = order === 'asc' ? 1 : -1;

    return [...prompts].sort((a, b) => {
      switch (field) {
        case 'createdAt':
          return (a.metadata.createdAt - b.metadata.createdAt) * multiplier;
        case 'updatedAt':
          return (a.metadata.updatedAt - b.metadata.updatedAt) * multiplier;
        case 'usedCount':
          return (a.stats.usedCount - b.stats.usedCount) * multiplier;
        case 'title':
          return a.title.localeCompare(b.title) * multiplier;
        default:
          return 0;
      }
    });
  }

  private paginate(
    items: Prompt[],
    pagination: { page: number; limit: number }
  ): { items: Prompt[]; hasMore: boolean } {
    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      items: items.slice(start, end),
      hasMore: end < items.length
    };
  }
}
