export class DIContainer {
  private instances = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  registerSingleton<T>(key: string, factory: () => T): void {
    this.register(key, () => {
      if (!this.instances.has(key)) {
        this.instances.set(key, factory());
      }
      return this.instances.get(key);
    });
  }

  resolve<T>(key: string): T {
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`No registration found for: ${key}`);
    }
    return factory();
  }

  clear(): void {
    this.instances.clear();
    this.factories.clear();
  }
}

// Global container instance
let globalContainer: DIContainer | null = null;

export function getContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = new DIContainer();
  }
  return globalContainer;
}
