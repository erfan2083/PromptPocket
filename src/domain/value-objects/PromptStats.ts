export interface PromptStatsDTO {
  usedCount: number;
  lastUsedAt: number;
}

export class PromptStats {
  private constructor(
    public readonly usedCount: number,
    public readonly lastUsedAt: number
  ) {
    Object.freeze(this);
  }

  static initial(): PromptStats {
    return new PromptStats(0, 0);
  }

  static reconstitute(dto: PromptStatsDTO): PromptStats {
    return new PromptStats(dto.usedCount, dto.lastUsedAt);
  }

  increment(): PromptStats {
    return new PromptStats(this.usedCount + 1, Date.now());
  }

  toDTO(): PromptStatsDTO {
    return {
      usedCount: this.usedCount,
      lastUsedAt: this.lastUsedAt
    };
  }
}
