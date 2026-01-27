import { IPlatformAdapter } from '@application/ports/output/IPlatformAdapter';

export class AdapterRegistry {
  private adapters: IPlatformAdapter[] = [];
  private activeAdapter: IPlatformAdapter | null = null;

  register(adapter: IPlatformAdapter): void {
    this.adapters.push(adapter);
  }

  async detectAndInit(): Promise<IPlatformAdapter | null> {
    for (const adapter of this.adapters) {
      if (adapter.matches()) {
        console.log(`[PromptPocket] Detected platform: ${adapter.name}`);
        await adapter.init();
        this.activeAdapter = adapter;
        return adapter;
      }
    }

    console.log('[PromptPocket] No matching platform adapter found');
    return null;
  }

  getActive(): IPlatformAdapter | null {
    return this.activeAdapter;
  }

  destroy(): void {
    if (this.activeAdapter) {
      this.activeAdapter.destroy();
      this.activeAdapter = null;
    }
  }
}
