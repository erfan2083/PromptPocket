import Fuse from 'fuse.js';
import { ISearchIndex, SearchResult, SearchMatch } from '@application/ports/output/ISearchIndex';
import { Prompt, PromptDTO } from '@domain/entities/Prompt';
import { PromptId } from '@domain/value-objects/PromptId';
import { SearchOptions } from '@shared/types';

export class FuseSearchEngine implements ISearchIndex {
  private fuse: Fuse<PromptDTO> | null = null;
  private prompts: PromptDTO[] = [];

  private readonly options: Fuse.IFuseOptions<PromptDTO> = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'content', weight: 0.5 },
      { name: 'tags', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    useExtendedSearch: false
  };

  async add(prompt: Prompt): Promise<void> {
    const dto = prompt.toDTO();
    this.prompts.push(dto);
    await this.rebuildIndex();
  }

  async update(prompt: Prompt): Promise<void> {
    const index = this.prompts.findIndex(p => p.id === prompt.id.value);
    if (index !== -1) {
      this.prompts[index] = prompt.toDTO();
      await this.rebuildIndex();
    }
  }

  async remove(id: PromptId): Promise<void> {
    this.prompts = this.prompts.filter(p => p.id !== id.value);
    await this.rebuildIndex();
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    const results = this.fuse.search(query);

    return results.map(result => ({
      prompt: Prompt.reconstitute(result.item),
      score: result.score || 0,
      matches: this.convertMatches(result.matches || [])
    }));
  }

  async rebuild(prompts: Prompt[]): Promise<void> {
    this.prompts = prompts.map(p => p.toDTO());
    await this.rebuildIndex();
  }

  private async rebuildIndex(): Promise<void> {
    this.fuse = new Fuse(this.prompts, this.options);
  }

  private convertMatches(fuseMatches: readonly Fuse.FuseResultMatch[]): SearchMatch[] {
    return fuseMatches.map(match => ({
      key: match.key || '',
      value: match.value || '',
      indices: match.indices as [number, number][]
    }));
  }
}
