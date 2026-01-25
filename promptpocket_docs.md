# PromptPocket - Complete Technical Documentation

> **A professional browser extension for saving, organizing, and reusing AI prompts**

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Tech Stack:** React 18 + TypeScript 5 + Vite 5 + Tailwind CSS  
**Architecture:** Hexagonal (Ports & Adapters)  
**License:** MIT

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Architecture Design](#3-architecture-design)
4. [Technical Stack](#4-technical-stack)
5. [Project Structure](#5-project-structure)
6. [Domain Model](#6-domain-model)
7. [Hexagonal Architecture Implementation](#7-hexagonal-architecture-implementation)
8. [Platform Adapters](#8-platform-adapters)
9. [Storage Strategy](#9-storage-strategy)
10. [UI/UX Implementation](#10-uiux-implementation)
11. [Search & Filter Engine](#11-search--filter-engine)
12. [Testing Strategy](#12-testing-strategy)
13. [Development Workflow](#13-development-workflow)
14. [Deployment & Distribution](#14-deployment--distribution)
15. [Security & Privacy](#15-security--privacy)
16. [Performance Optimization](#16-performance-optimization)
17. [Error Handling](#17-error-handling)
18. [Monitoring & Analytics](#18-monitoring--analytics)
19. [Future Roadmap](#19-future-roadmap)
20. [Appendices](#20-appendices)

---

## 1. Executive Summary

### 1.1 Vision
PromptPocket is a browser extension that empowers users to build a personal library of AI prompts, enabling efficient reuse, organization, and discovery across multiple AI chat platforms.

### 1.2 Key Features
- **One-Click Save**: Save prompts directly from chat interfaces
- **Smart Organization**: Folders + multi-tag system
- **Powerful Search**: Full-text, fuzzy, and filtered search
- **Platform Agnostic**: Extensible adapter architecture
- **Privacy First**: 100% local-first storage
- **Professional UX**: Modern, responsive, accessible

### 1.3 Target Users
- AI Power Users
- Content Creators
- Developers & Technical Writers
- Researchers & Students
- Marketing Professionals
- Anyone using AI chat regularly

---

## 2. Product Overview

### 2.1 Core Value Proposition

**Problem**: Users create excellent prompts but lose them in chat history, leading to:
- Wasted time recreating prompts
- Inconsistent quality
- No systematic learning from what works

**Solution**: PromptPocket provides a dedicated workspace to:
- Save prompts with context
- Organize with flexible taxonomy
- Find prompts instantly
- Reuse with one click

### 2.2 User Flows

#### Primary Flow: Save Prompt
```
User types prompt → Sends message → Clicks ⭐ icon → 
Quick save OR Opens form → Selects folder/tags → Saves → 
Confirmation feedback
```

#### Secondary Flow: Reuse Prompt
```
Opens side panel → Searches/filters → Previews prompt → 
Clicks insert → Prompt appears in input box → User sends
```

#### Tertiary Flow: Organize Library
```
Opens library → Views prompts → Edits/moves/tags → 
Exports backup → Manages folders/tags
```

### 2.3 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users (DAU) | 70% of installs | Analytics |
| Prompts per User | Avg 20+ in Week 1 | Storage data |
| Search Success Rate | >90% find in <10s | User testing |
| Reuse Rate | 50%+ prompts reused | Usage stats |
| Retention (Week 4) | >60% | Analytics |

---

## 3. Architecture Design

### 3.1 Hexagonal Architecture Overview

We implement **Hexagonal Architecture** (Ports & Adapters) for:
- **Testability**: Business logic isolated from infrastructure
- **Flexibility**: Easy to swap implementations
- **Maintainability**: Clear separation of concerns
- **Scalability**: New platforms/features without touching core

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION CORE                     │
│                  (Business Logic)                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Domain Layer                        │  │
│  │  - Prompt (Entity)                               │  │
│  │  - Folder (Entity)                               │  │
│  │  - Tag (Value Object)                            │  │
│  │  - Domain Services                               │  │
│  └──────────────────────────────────────────────────┘  │
│                         ▲                               │
│                         │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Application Services (Use Cases)        │  │
│  │  - SavePromptUseCase                             │  │
│  │  - SearchPromptsUseCase                          │  │
│  │  - OrganizeLibraryUseCase                        │  │
│  │  - InsertPromptUseCase                           │  │
│  └──────────────────────────────────────────────────┘  │
│                         ▲                               │
│                         │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │               Ports (Interfaces)                 │  │
│  │                                                  │  │
│  │  Input Ports:          Output Ports:            │  │
│  │  - IPromptService      - IPromptRepository      │  │
│  │  - ISearchService      - IStorageService        │  │
│  │  - ILibraryService     - IPlatformDetector      │  │
│  │                        - ISearchIndex           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
         ┌────────────────┴────────────────┐
         │                                 │
┌────────▼────────┐              ┌────────▼────────┐
│  PRIMARY         │              │  SECONDARY       │
│  ADAPTERS        │              │  ADAPTERS        │
│  (Drivers)       │              │  (Driven)        │
├──────────────────┤              ├──────────────────┤
│ - React UI       │              │ - IndexedDB      │
│ - Content Script │              │ - Chrome Storage │
│ - Side Panel     │              │ - Platform       │
│ - Popup          │              │   Adapters       │
│ - Background     │              │ - Search Engine  │
└──────────────────┘              └──────────────────┘
```

### 3.2 Layer Responsibilities

#### 3.2.1 Domain Layer (Core)
**Location**: `src/domain/`

**Responsibilities**:
- Define business entities (Prompt, Folder, Tag)
- Define business rules and invariants
- No dependencies on external libraries
- Pure TypeScript/JavaScript

**Example**:
```typescript
// src/domain/entities/Prompt.ts
export class Prompt {
  constructor(
    public readonly id: PromptId,
    public title: string,
    public content: string,
    public folderId: FolderId,
    public tags: Tag[],
    public metadata: PromptMetadata
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.content.length === 0) {
      throw new Error('Prompt content cannot be empty');
    }
    if (this.content.length > 10000) {
      throw new Error('Prompt content exceeds maximum length');
    }
    if (this.tags.length > 20) {
      throw new Error('Too many tags');
    }
  }

  update(data: Partial<PromptData>): Prompt {
    return new Prompt(
      this.id,
      data.title ?? this.title,
      data.content ?? this.content,
      data.folderId ?? this.folderId,
      data.tags ?? this.tags,
      { ...this.metadata, updatedAt: Date.now() }
    );
  }
}
```

#### 3.2.2 Application Layer (Use Cases)
**Location**: `src/application/`

**Responsibilities**:
- Orchestrate business logic
- Define use cases (user stories)
- Coordinate between domain and infrastructure
- Handle transactions

**Example**:
```typescript
// src/application/use-cases/SavePromptUseCase.ts
export class SavePromptUseCase {
  constructor(
    private promptRepository: IPromptRepository,
    private searchIndex: ISearchIndex,
    private eventBus: IEventBus
  ) {}

  async execute(request: SavePromptRequest): Promise<SavePromptResponse> {
    // 1. Create domain entity
    const prompt = Prompt.create({
      content: request.content,
      folderId: request.folderId || this.getDefaultFolderId(),
      tags: request.tags || [],
      metadata: {
        platform: request.platform,
        url: request.url,
        createdAt: Date.now()
      }
    });

    // 2. Persist
    await this.promptRepository.save(prompt);

    // 3. Update search index
    await this.searchIndex.add(prompt);

    // 4. Emit event
    await this.eventBus.publish(new PromptSavedEvent(prompt));

    return { promptId: prompt.id, success: true };
  }
}
```

#### 3.2.3 Infrastructure Layer (Adapters)
**Location**: `src/infrastructure/`

**Responsibilities**:
- Implement ports defined by application layer
- Handle external dependencies (DB, APIs, Browser APIs)
- Platform-specific code
- UI components

**Example**:
```typescript
// src/infrastructure/repositories/IndexedDBPromptRepository.ts
export class IndexedDBPromptRepository implements IPromptRepository {
  async save(prompt: Prompt): Promise<void> {
    const db = await this.getDB();
    await db.put('prompts', this.toDTO(prompt));
  }

  async findById(id: PromptId): Promise<Prompt | null> {
    const db = await this.getDB();
    const dto = await db.get('prompts', id.value);
    return dto ? this.toDomain(dto) : null;
  }

  // ... other methods
}
```

### 3.3 Dependency Rule

**Golden Rule**: Dependencies point inward only

```
Infrastructure → Application → Domain
     ❌            ✅           ✅
Domain → Application → Infrastructure
```

- Domain layer has ZERO dependencies
- Application layer depends only on Domain
- Infrastructure depends on Application + Domain

---

## 4. Technical Stack

### 4.1 Core Technologies

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Language** | TypeScript | 5.3+ | Type safety, better DX, maintainability |
| **Framework** | React | 18.2+ | Component reusability, ecosystem |
| **Build Tool** | Vite | 5.0+ | Fast HMR, modern, optimized builds |
| **UI Library** | Tailwind CSS | 3.4+ | Utility-first, consistent design |
| **Components** | shadcn/ui | Latest | Accessible, customizable, Radix-based |
| **Icons** | Lucide React | 0.300+ | Consistent, tree-shakeable |
| **Search** | Fuse.js | 7.0+ | Fuzzy search, lightweight |
| **State** | Zustand | 4.4+ | Simple, performant, minimal boilerplate |
| **Testing** | Playwright | 1.40+ | E2E testing for extensions |
| **Testing** | Vitest | 1.0+ | Unit/integration testing, Vite-native |
| **Linting** | ESLint | 8.5+ | Code quality |
| **Formatting** | Prettier | 3.1+ | Consistent formatting |

### 4.2 Browser APIs

| API | Usage | Fallback |
|-----|-------|----------|
| `chrome.storage.local` | Extension settings | localStorage |
| `IndexedDB` | Prompt storage | chrome.storage.local |
| `chrome.sidePanel` | Main UI | chrome.action popup |
| `MutationObserver` | DOM monitoring | Polling (not recommended) |
| `chrome.runtime.sendMessage` | Cross-context communication | N/A |

### 4.3 Development Tools

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/chrome": "^0.0.260",
    "@types/react": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "postcss": "^8.4.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 5. Project Structure

### 5.1 Directory Layout

```
promptpocket/
├── src/
│   ├── domain/                    # Core business logic (no dependencies)
│   │   ├── entities/
│   │   │   ├── Prompt.ts
│   │   │   ├── Folder.ts
│   │   │   └── Tag.ts
│   │   ├── value-objects/
│   │   │   ├── PromptId.ts
│   │   │   ├── FolderId.ts
│   │   │   └── PromptMetadata.ts
│   │   ├── services/
│   │   │   ├── PromptValidator.ts
│   │   │   └── SearchRanker.ts
│   │   └── events/
│   │       ├── PromptSavedEvent.ts
│   │       └── PromptDeletedEvent.ts
│   │
│   ├── application/               # Use cases & application logic
│   │   ├── ports/
│   │   │   ├── input/
│   │   │   │   ├── IPromptService.ts
│   │   │   │   ├── ISearchService.ts
│   │   │   │   └── ILibraryService.ts
│   │   │   └── output/
│   │   │       ├── IPromptRepository.ts
│   │   │       ├── ISearchIndex.ts
│   │   │       ├── IStorageService.ts
│   │   │       └── IPlatformAdapter.ts
│   │   ├── use-cases/
│   │   │   ├── prompt/
│   │   │   │   ├── SavePromptUseCase.ts
│   │   │   │   ├── UpdatePromptUseCase.ts
│   │   │   │   ├── DeletePromptUseCase.ts
│   │   │   │   └── GetPromptUseCase.ts
│   │   │   ├── search/
│   │   │   │   ├── SearchPromptsUseCase.ts
│   │   │   │   └── GetPromptSuggestionsUseCase.ts
│   │   │   ├── library/
│   │   │   │   ├── OrganizeLibraryUseCase.ts
│   │   │   │   ├── ExportLibraryUseCase.ts
│   │   │   │   └── ImportLibraryUseCase.ts
│   │   │   └── platform/
│   │   │       ├── InsertPromptUseCase.ts
│   │   │       └── DetectPlatformUseCase.ts
│   │   └── dto/
│   │       ├── SavePromptRequest.ts
│   │       ├── SearchRequest.ts
│   │       └── responses/
│   │
│   ├── infrastructure/            # External adapters & implementations
│   │   ├── repositories/
│   │   │   ├── IndexedDBPromptRepository.ts
│   │   │   ├── ChromeStorageSettingsRepository.ts
│   │   │   └── InMemoryPromptRepository.ts (for testing)
│   │   ├── search/
│   │   │   ├── FuseSearchEngine.ts
│   │   │   └── SearchIndexManager.ts
│   │   ├── storage/
│   │   │   ├── IndexedDBService.ts
│   │   │   └── ChromeStorageService.ts
│   │   ├── platform-adapters/
│   │   │   ├── base/
│   │   │   │   ├── BasePlatformAdapter.ts
│   │   │   │   └── AdapterRegistry.ts
│   │   │   ├── chatgpt/
│   │   │   │   ├── ChatGPTAdapter.ts
│   │   │   │   ├── ChatGPTSelectors.ts
│   │   │   │   └── ChatGPTInjector.ts
│   │   │   ├── claude/
│   │   │   │   └── ClaudeAdapter.ts (future)
│   │   │   └── utils/
│   │   │       ├── DOMObserver.ts
│   │   │       └── EventInjector.ts
│   │   └── messaging/
│   │       ├── ChromeMessageBus.ts
│   │       └── EventBus.ts
│   │
│   ├── presentation/              # UI layer
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   ├── features/
│   │   │   │   ├── PromptCard.tsx
│   │   │   │   ├── PromptList.tsx
│   │   │   │   ├── SavePromptDialog.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FolderTree.tsx
│   │   │   │   └── TagCloud.tsx
│   │   │   └── layout/
│   │   │       ├── SidePanel.tsx
│   │   │       ├── Navigation.tsx
│   │   │       └── Header.tsx
│   │   ├── pages/
│   │   │   ├── Library.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Welcome.tsx
│   │   ├── hooks/
│   │   │   ├── usePrompts.ts
│   │   │   ├── useSearch.ts
│   │   │   ├── useFolders.ts
│   │   │   └── usePlatform.ts
│   │   └── stores/
│   │       ├── promptStore.ts
│   │       ├── uiStore.ts
│   │       └── settingsStore.ts
│   │
│   ├── content-script/            # Content script entry
│   │   ├── index.tsx
│   │   ├── injector.ts
│   │   └── styles.css
│   │
│   ├── background/                # Service worker entry
│   │   ├── index.ts
│   │   ├── messageHandler.ts
│   │   └── initialization.ts
│   │
│   ├── side-panel/                # Side panel entry
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── styles.css
│   │
│   ├── shared/                    # Shared utilities
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── messages.ts
│   │   ├── constants/
│   │   │   ├── platforms.ts
│   │   │   └── defaults.ts
│   │   ├── utils/
│   │   │   ├── uuid.ts
│   │   │   ├── debounce.ts
│   │   │   └── validation.ts
│   │   └── config/
│   │       └── app.config.ts
│   │
│   └── types/                     # Global type definitions
│       └── global.d.ts
│
├── public/                        # Static assets
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── manifest.json
│
├── tests/                         # Test files
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/
│   │   └── use-cases/
│   └── e2e/
│       ├── chatgpt/
│       │   ├── save-prompt.spec.ts
│       │   └── insert-prompt.spec.ts
│       └── library/
│           └── search.spec.ts
│
├── scripts/                       # Build & utility scripts
│   ├── build.ts
│   ├── package.ts
│   └── generate-icons.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
│
├── docs/                          # Additional documentation
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── API.md
│
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── package.json
└── README.md
```

### 5.2 File Naming Conventions

| Type | Convention | Example |
|------|-----------|----------|
| **Components** | PascalCase | `PromptCard.tsx` |
| **Hooks** | camelCase with `use` prefix | `usePrompts.ts` |
| **Utils** | camelCase | `debounce.ts` |
| **Types/Interfaces** | PascalCase with `I` prefix (interfaces) | `IPromptRepository.ts` |
| **Constants** | UPPER_SNAKE_CASE | `DEFAULT_FOLDER.ts` |
| **Tests** | Same as source + `.spec.ts` | `Prompt.spec.ts` |

---

## 6. Domain Model

### 6.1 Core Entities

#### 6.1.1 Prompt Entity

```typescript
// src/domain/entities/Prompt.ts

export class Prompt {
  private constructor(
    public readonly id: PromptId,
    public readonly title: string,
    public readonly content: string,
    public readonly folderId: FolderId,
    public readonly tags: ReadonlyArray<Tag>,
    public readonly metadata: PromptMetadata,
    public readonly stats: PromptStats
  ) {
    Object.freeze(this);
  }

  static create(data: CreatePromptData): Prompt {
    const id = PromptId.generate();
    const title = data.title || this.generateTitle(data.content);
    const metadata = PromptMetadata.create(data.platform, data.url);
    const stats = PromptStats.initial();

    return new Prompt(
      id,
      title,
      data.content,
      data.folderId,
      data.tags || [],
      metadata,
      stats
    );
  }

  static reconstitute(data: PromptDTO): Prompt {
    return new Prompt(
      new PromptId(data.id),
      data.title,
      data.content,
      new FolderId(data.folderId),
      data.tags.map(t => Tag.fromString(t)),
      PromptMetadata.reconstitute(data.metadata),
      PromptStats.reconstitute(data.stats)
    );
  }

  update(changes: PromptUpdateData): Prompt {
    return new Prompt(
      this.id,
      changes.title ?? this.title,
      changes.content ?? this.content,
      changes.folderId ?? this.folderId,
      changes.tags ?? this.tags,
      this.metadata.markUpdated(),
      this.stats
    );
  }

  incrementUsage(): Prompt {
    return new Prompt(
      this.id,
      this.title,
      this.content,
      this.folderId,
      this.tags,
      this.metadata,
      this.stats.increment()
    );
  }

  private static generateTitle(content: string): string {
    const maxLength = 60;
    const cleaned = content.trim().replace(/\s+/g, ' ');
    return cleaned.length > maxLength 
      ? cleaned.substring(0, maxLength) + '...'
      : cleaned;
  }

  toDTO(): PromptDTO {
    return {
      id: this.id.value,
      title: this.title,
      content: this.content,
      folderId: this.folderId.value,
      tags: this.tags.map(t => t.value),
      metadata: this.metadata.toDTO(),
      stats: this.stats.toDTO()
    };
  }
}
```

#### 6.1.2 Folder Entity

```typescript
// src/domain/entities/Folder.ts

export class Folder {
  private constructor(
    public readonly id: FolderId,
    public readonly name: string,
    public readonly parentId: FolderId | null,
    public readonly color: string,
    public readonly createdAt: number
  ) {
    this.validateName(name);
    Object.freeze(this);
  }

  static create(name: string, parentId?: FolderId): Folder {
    return new Folder(
      FolderId.generate(),
      name,
      parentId || null,
      this.generateColor(),
      Date.now()
    );
  }

  rename(newName: string): Folder {
    return new Folder(
      this.id,
      newName,
      this.parentId,
      this.color,
      this.createdAt
    );
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Folder name cannot be empty');
    }
    if (name.length > 50) {
      throw new Error('Folder name too long');
    }
  }

  private static generateColor(): string {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
```

### 6.2 Value Objects

#### 6.2.1 PromptId

```typescript
// src/domain/value-objects/PromptId.ts

export class PromptId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid PromptId');
    }
    this._value = value;
  }

  static generate(): PromptId {
    return new PromptId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: PromptId): boolean {
    return this._value === other._value;
  }

  private isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
```

#### 6.2.2 Tag

```typescript
// src/domain/value-objects/Tag.ts

export class Tag {
  private constructor(public readonly value: string) {
    this.validate(value);
    Object.freeze(this);
  }

  static fromString(value: string): Tag {
    return new Tag(value.toLowerCase().trim());
  }

  private validate(value: string): void {
    if (value.length === 0 || value.length > 30) {
      throw new Error('Tag must be 1-30 characters');
    }
    if (!/^[a-z0-9-_]+$/.test(value)) {
      throw new Error('Tag can only contain lowercase letters, numbers, hyphens, underscores');
    }
  }

  equals(other: Tag): boolean {
    return this.value === other.value;
  }
}
```

### 6.3 Domain Events

```typescript
// src/domain/events/PromptEvents.ts

export abstract class DomainEvent {
  public readonly occurredAt: number;

  constructor() {
    this.occurredAt = Date.now();
  }
}

export class PromptSavedEvent extends DomainEvent {
  constructor(public readonly prompt: Prompt) {
    super();
  }
}

export class PromptUpdatedEvent extends DomainEvent {
  constructor(
    public readonly promptId: PromptId,
    public readonly changes: PromptUpdateData
  ) {
    super();
  }
}

export class PromptDeletedEvent extends DomainEvent {
  constructor(public readonly promptId: PromptId) {
    super();
  }
}
```

---

## 7. Hexagonal Architecture Implementation

### 7.1 Ports (Interfaces)

#### 7.1.1 Input Ports (Application → Domain)

```typescript
// src/application/ports/input/IPromptService.ts

export interface IPromptService {
  savePrompt(request: SavePromptRequest): Promise<SavePromptResponse>;
  updatePrompt(id: PromptId, data: PromptUpdateData): Promise<void>;
  deletePrompt(id: PromptId): Promise<void>;
  getPrompt(id: PromptId): Promise<Prompt | null>;
  getAllPrompts(): Promise<Prompt[]>;
}

// src/application/ports/input/ISearchService.ts

export interface ISearchService {
  search(query: SearchQuery): Promise<SearchResult[]>;
  getSuggestions(partial: string): Promise<string[]>;
  rebuildIndex(): Promise<void>;
}
```

#### 7.1.2 Output Ports (Application → Infrastructure)

```typescript
// src/application/ports/output/IPromptRepository.ts

export interface IPromptRepository {
  save(prompt: Prompt): Promise<void>;
  findById(id: PromptId): Promise<Prompt | null>;
  findAll(): Promise<Prompt[]>;
  findByFolderId(folderId: FolderId): Promise<Prompt[]>;
  findByTags(tags: Tag[]): Promise<Prompt[]>;
  delete(id: PromptId): Promise<void>;
  exists(id: PromptId): Promise<boolean>;
}

// src/application/ports/output/ISearchIndex.ts

export interface ISearchIndex {
  add(prompt: Prompt): Promise<void>;
  update(prompt: Prompt): Promise<void>;
  remove(id: PromptId): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  rebuild(prompts: Prompt[]): Promise<void>;
}

// src/application/ports/output/IPlatformAdapter.ts

export interface IPlatformAdapter {
  readonly name: string;
  readonly platform: PlatformType;
  
  matches(): boolean;
  init(): Promise<void>;
  destroy(): void;
  
  getUserMessages(): HTMLElement[];
  getMessageText(element: HTMLElement): string;
  getInputBox(): HTMLElement | null;
  
  insertText(text: string): Promise<void>;
  
  onNewMessage(callback: (element: HTMLElement) => void): void;
  offNewMessage(callback: (element: HTMLElement) => void): void;
}
```

### 7.2 Dependency Injection Container

```typescript
// src/infrastructure/di/Container.ts

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
      throw new Error(`No registration found for ${key}`);
    }
    return factory();
  }

  clear(): void {
    this.instances.clear();
    this.factories.clear();
  }
}

// src/infrastructure/di/setup.ts

export function setupDI(container: DIContainer): void {
  // Storage layer
  container.registerSingleton('IStorageService', () => new IndexedDBService());
  
  // Repositories
  container.registerSingleton('IPromptRepository', () => 
    new IndexedDBPromptRepository(container.resolve('IStorageService'))
  );
  
  container.registerSingleton('IFolderRepository', () =>
    new ChromeStorageFolderRepository()
  );
  
  // Search
  container.registerSingleton('ISearchIndex', () =>
    new FuseSearchEngine()
  );
  
  // Platform adapters
  container.registerSingleton('AdapterRegistry', () => {
    const registry = new AdapterRegistry();
    registry.register(new ChatGPTAdapter());
    // Future: registry.register(new ClaudeAdapter());
    return registry;
  });
  
  // Use cases
  container.register('SavePromptUseCase', () =>
    new SavePromptUseCase(
      container.resolve('IPromptRepository'),
      container.resolve('ISearchIndex'),
      container.resolve('IEventBus')
    )
  );
  
  container.register('SearchPromptsUseCase', () =>
    new SearchPromptsUseCase(
      container.resolve('ISearchIndex'),
      container.resolve('IPromptRepository')
    )
  );
  
  // ... other use cases
}
```

### 7.3 Use Case Implementation Example

```typescript
// src/application/use-cases/prompt/SavePromptUseCase.ts

export class SavePromptUseCase {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly searchIndex: ISearchIndex,
    private readonly eventBus: IEventBus
  ) {}

  async execute(request: SavePromptRequest): Promise<SavePromptResponse> {
    try {
      // 1. Validate request
      this.validateRequest(request);

      // 2. Create domain entity
      const prompt = Prompt.create({
        content: request.content,
        title: request.title,
        folderId: request.folderId || this.getDefaultFolderId(),
        tags: request.tags?.map(t => Tag.fromString(t)) || [],
        platform: request.platform,
        url: request.url
      });

      // 3. Check for duplicates (business rule)
      const isDuplicate = await this.checkDuplicate(prompt);
      if (isDuplicate && !request.allowDuplicate) {
        throw new DuplicatePromptError();
      }

      // 4. Persist
      await this.promptRepository.save(prompt);

      // 5. Update search index
      await this.searchIndex.add(prompt);

      // 6. Publish event
      await this.eventBus.publish(new PromptSavedEvent(prompt));

      return {
        success: true,
        promptId: prompt.id.value,
        prompt: prompt.toDTO()
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      };
    }
  }

  private validateRequest(request: SavePromptRequest): void {
    if (!request.content || request.content.trim().length === 0) {
      throw new ValidationError('Content cannot be empty');
    }
    
    if (request.content.length > 10000) {
      throw new ValidationError('Content exceeds maximum length');
    }
  }

  private async checkDuplicate(prompt: Prompt): Promise<boolean> {
    const existing = await this.promptRepository.findAll();
    return existing.some(p => 
      p.content.trim() === prompt.content.trim()
    );
  }

  private getDefaultFolderId(): FolderId {
    return new FolderId('default');
  }

  private handleError(error: unknown): ErrorDTO {
    if (error instanceof ValidationError) {
      return { type: 'validation', message: error.message };
    }
    if (error instanceof DuplicatePromptError) {
      return { type: 'duplicate', message: 'Prompt already exists' };
    }
    return { type: 'unknown', message: 'Failed to save prompt' };
  }
}
```

---

## 8. Platform Adapters

### 8.1 Base Adapter

```typescript
// src/infrastructure/platform-adapters/base/BasePlatformAdapter.ts

export abstract class BasePlatformAdapter implements IPlatformAdapter {
  protected observers: MutationObserver[] = [];
  protected messageCallbacks: Set<(element: HTMLElement) => void> = new Set();

  abstract readonly name: string;
  abstract readonly platform: PlatformType;
  
  abstract matches(): boolean;
  abstract getSelectors(): PlatformSelectors;

  async init(): Promise<void> {
    this.observeMessages();
    this.injectStyles();
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.messageCallbacks.clear();
  }

  getUserMessages(): HTMLElement[] {
    const selectors = this.getSelectors();
    return Array.from(
      document.querySelectorAll<HTMLElement>(selectors.userMessage)
    );
  }

  getMessageText(element: HTMLElement): string {
    const selectors = this.getSelectors();
    const textElement = element.querySelector<HTMLElement>(
      selectors.messageText
    );
    return textElement?.innerText || '';
  }

  getInputBox(): HTMLElement | null {
    const selectors = this.getSelectors();
    return document.querySelector<HTMLElement>(selectors.inputBox);
  }

  async insertText(text: string): Promise<void> {
    const input = this.getInputBox();
    if (!input) {
      throw new Error('Input box not found');
    }

    // Handle different input types
    if (this.isContentEditable(input)) {
      await this.insertIntoContentEditable(input, text);
    } else if (this.isTextarea(input)) {
      await this.insertIntoTextarea(input as HTMLTextAreaElement, text);
    } else {
      throw new Error('Unsupported input type');
    }
  }

  onNewMessage(callback: (element: HTMLElement) => void): void {
    this.messageCallbacks.add(callback);
  }

  offNewMessage(callback: (element: HTMLElement) => void): void {
    this.messageCallbacks.delete(callback);
  }

  protected observeMessages(): void {
    const selectors = this.getSelectors();
    const container = document.querySelector(selectors.messagesContainer);
    
    if (!container) {
      console.warn(`Messages container not found for ${this.name}`);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (this.isUserMessage(node)) {
              this.messageCallbacks.forEach(cb => cb(node));
            }
          }
        }
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  protected abstract isUserMessage(element: HTMLElement): boolean;

  protected isContentEditable(element: HTMLElement): boolean {
    return element.contentEditable === 'true' || 
           element.getAttribute('contenteditable') === 'true';
  }

  protected isTextarea(element: HTMLElement): boolean {
    return element.tagName === 'TEXTAREA';
  }

  protected async insertIntoContentEditable(
    element: HTMLElement, 
    text: string
  ): Promise<void> {
    // Set the text
    element.innerText = text;

    // Trigger input events for React/frameworks
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);

    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);

    // Focus
    element.focus();
  }

  protected async insertIntoTextarea(
    textarea: HTMLTextAreaElement,
    text: string
  ): Promise<void> {
    // Native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, text);
    } else {
      textarea.value = text;
    }

    // Trigger events
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    
    textarea.focus();
  }

  protected injectStyles(): void {
    const styleId = `promptpocket-${this.platform}-styles`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = this.getCustomStyles();
    document.head.appendChild(style);
  }

  protected getCustomStyles(): string {
    return '';
  }
}
```

### 8.2 ChatGPT Adapter

```typescript
// src/infrastructure/platform-adapters/chatgpt/ChatGPTAdapter.ts

export class ChatGPTAdapter extends BasePlatformAdapter {
  readonly name = 'ChatGPT';
  readonly platform = PlatformType.ChatGPT;

  matches(): boolean {
    return window.location.hostname.includes('chatgpt.com') ||
           window.location.hostname.includes('chat.openai.com');
  }

  getSelectors(): PlatformSelectors {
    return {
      messagesContainer: '[data-testid^="conversation-turn"]',
      userMessage: '[data-message-author-role="user"]',
      assistantMessage: '[data-message-author-role="assistant"]',
      messageText: '.whitespace-pre-wrap',
      inputBox: '#prompt-textarea',
    };
  }

  protected isUserMessage(element: HTMLElement): boolean {
    return element.hasAttribute('data-message-author-role') &&
           element.getAttribute('data-message-author-role') === 'user';
  }

  protected getCustomStyles(): string {
    return `
      .promptpocket-save-btn {
        position: absolute;
        right: 8px;
        top: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      [data-message-author-role="user"]:hover .promptpocket-save-btn {
        opacity: 1;
      }
    `;
  }

  // ChatGPT-specific: Handle streaming messages
  async waitForMessageComplete(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const checkComplete = () => {
        const isStreaming = element.querySelector('[data-is-streaming="true"]');
        if (!isStreaming) {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });
  }
}
```

### 8.3 Adapter Registry

```typescript
// src/infrastructure/platform-adapters/base/AdapterRegistry.ts

export class AdapterRegistry {
  private adapters: IPlatformAdapter[] = [];
  private activeAdapter: IPlatformAdapter | null = null;

  register(adapter: IPlatformAdapter): void {
    this.adapters.push(adapter);
  }

  async detectAndInit(): Promise<IPlatformAdapter | null> {
    for (const adapter of this.adapters) {
      if (adapter.matches()) {
        await adapter.init();
        this.activeAdapter = adapter;
        return adapter;
      }
    }
    return null;
  }

  getActive(): IPlatformAdapter | null {
    return this.activeAdapter;
  }

  destroy(): void {
    this.activeAdapter?.destroy();
    this.activeAdapter = null;
  }
}
```

---

## 9. Storage Strategy

### 9.1 Storage Architecture

```typescript
// src/infrastructure/storage/IndexedDBService.ts

export class IndexedDBService implements IStorageService {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'PromptPocketDB';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createSchema(db);
      };
    });
  }

  private createSchema(db: IDBDatabase): void {
    // Prompts store
    if (!db.objectStoreNames.contains('prompts')) {
      const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
      promptStore.createIndex('folderId', 'folderId', { unique: false });
      promptStore.createIndex('createdAt', 'metadata.createdAt', { unique: false });
      promptStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
    }

    // Folders store
    if (!db.objectStoreNames.contains('folders')) {
      const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
      folderStore.createIndex('name', 'name', { unique: false });
    }
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(storeName: string, value: T): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

### 9.2 Repository Implementation

```typescript
// src/infrastructure/repositories/IndexedDBPromptRepository.ts

export class IndexedDBPromptRepository implements IPromptRepository {
  constructor(private readonly storage: IStorageService) {}

  async save(prompt: Prompt): Promise<void> {
    const dto = prompt.toDTO();
    await this.storage.set('prompts', dto);
  }

  async findById(id: PromptId): Promise<Prompt | null> {
    const dto = await this.storage.get<PromptDTO>('prompts', id.value);
    return dto ? Prompt.reconstitute(dto) : null;
  }

  async findAll(): Promise<Prompt[]> {
    const dtos = await this.storage.getAll<PromptDTO>('prompts');
    return dtos.map(dto => Prompt.reconstitute(dto));
  }

  async findByFolderId(folderId: FolderId): Promise<Prompt[]> {
    const all = await this.findAll();
    return all.filter(p => p.folderId.equals(folderId));
  }

  async findByTags(tags: Tag[]): Promise<Prompt[]> {
    const all = await this.findAll();
    return all.filter(prompt => 
      tags.some(tag => 
        prompt.tags.some(t => t.equals(tag))
      )
    );
  }

  async delete(id: PromptId): Promise<void> {
    await this.storage.delete('prompts', id.value);
  }

  async exists(id: PromptId): Promise<boolean> {
    const prompt = await this.findById(id);
    return prompt !== null;
  }
}
```

### 9.3 Hybrid Storage Strategy

```typescript
// Chrome Storage for settings (synced across devices)
// IndexedDB for prompts (local, larger capacity)

export class HybridStorageStrategy {
  constructor(
    private chromeStorage: ChromeStorageService,
    private indexedDB: IndexedDBService
  ) {}

  async saveSettings(settings: Settings): Promise<void> {
    await this.chromeStorage.set('settings', settings);
  }

  async getSettings(): Promise<Settings> {
    return await this.chromeStorage.get('settings') || defaultSettings;
  }

  async saveFolders(folders: Folder[]): Promise<void> {
    const dtos = folders.map(f => f.toDTO());
    await this.chromeStorage.set('folders', dtos);
  }

  async savePrompts(prompts: Prompt[]): Promise<void> {
    for (const prompt of prompts) {
      await this.indexedDB.set('prompts', prompt.toDTO());
    }
  }

  async exportData(): Promise<ExportData> {
    const prompts = await this.indexedDB.getAll<PromptDTO>('prompts');
    const folders = await this.chromeStorage.get<FolderDTO[]>('folders');
    const settings = await this.chromeStorage.get<Settings>('settings');

    return {
      version: '1.0',
      exportedAt: Date.now(),
      prompts,
      folders: folders || [],
      settings: settings || defaultSettings
    };
  }

  async importData(data: ExportData): Promise<void> {
    // Validate
    if (!data.version || !data.prompts) {
      throw new Error('Invalid export file');
    }

    // Clear existing
    await this.indexedDB.clear('prompts');

    // Import
    for (const promptDTO of data.prompts) {
      await this.indexedDB.set('prompts', promptDTO);
    }

    if (data.folders) {
      await this.chromeStorage.set('folders', data.folders);
    }
  }
}
```

---

## 10. UI/UX Implementation

### 10.1 Component Architecture

```typescript
// src/presentation/components/features/SavePromptDialog.tsx

interface SavePromptDialogProps {
  content: string;
  onSave: (data: SavePromptFormData) => Promise<void>;
  onCancel: () => void;
}

export function SavePromptDialog({ content, onSave, onCancel }: SavePromptDialogProps) {
  const [formData, setFormData] = useState<SavePromptFormData>({
    title: generateTitle(content),
    folderId: 'default',
    tags: [],
    notes: ''
  });

  const { folders } = useFolders();
  const { tags: existingTags } = useTags();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
      toast.success('Prompt saved successfully!');
    } catch (error) {
      toast.error('Failed to save prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Save Prompt</DialogTitle>
          <DialogDescription>
            Organize your prompt for easy discovery later
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Auto-generated from prompt"
            />
          </div>

          {/* Folder */}
          <div>
            <Label htmlFor="folder">Folder</Label>
            <Select
              value={formData.folderId}
              onValueChange={(value) => setFormData({ ...formData, folderId: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              suggestions={existingTags}
            />
          </div>

          {/* Preview */}
          <div>
            <Label>Preview</Label>
            <div className="rounded-md border p-3 bg-muted max-h-32 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Prompt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 10.2 State Management with Zustand

```typescript
// src/presentation/stores/promptStore.ts

interface PromptStore {
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPrompts: () => Promise<void>;
  savePrompt: (data: SavePromptRequest) => Promise<void>;
  updatePrompt: (id: string, data: PromptUpdateData) => Promise<void>;
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
      const container = getDIContainer();
      const useCase = container.resolve<GetAllPromptsUseCase>('GetAllPromptsUseCase');
      const result = await useCase.execute();
      
      set({ prompts: result.prompts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load prompts', isLoading: false });
    }
  },

  savePrompt: async (data) => {
    const container = getDIContainer();
    const useCase = container.resolve<SavePromptUseCase>('SavePromptUseCase');
    
    const result = await useCase.execute(data);
    
    if (result.success) {
      await get().loadPrompts();
    } else {
      throw new Error(result.error?.message);
    }
  },

  getPromptById: (id) => {
    return get().prompts.find(p => p.id.value === id);
  },

  getPromptsByFolder: (folderId) => {
    return get().prompts.filter(p => p.folderId.value === folderId);
  },

  getPromptsByTags: (tags) => {
    return get().prompts.filter(p =>
      tags.some(tag => p.tags.some(t => t.value === tag))
    );
  }
}));
```

### 10.3 Custom Hooks

```typescript
// src/presentation/hooks/usePrompts.ts

export function usePrompts() {
  const store = usePromptStore();
  
  useEffect(() => {
    store.loadPrompts();
  }, []);
  
  return {
    prompts: store.prompts,
    isLoading: store.isLoading,
    error: store.error,
    savePrompt: store.savePrompt,
    updatePrompt: store.updatePrompt,
    deletePrompt: store.deletePrompt
  };
}

// src/presentation/hooks/useSearch.ts

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Prompt[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      const container = getDIContainer();
      const useCase = container.resolve<SearchPromptsUseCase>('SearchPromptsUseCase');
      
      const result = await useCase.execute({ query: debouncedQuery });
      setResults(result.prompts);
      setIsSearching(false);
    };

    search();
  }, [debouncedQuery]);

  return { query, setQuery, results, isSearching };
}
```

---

## 11. Search & Filter Engine

### 11.1 Fuse.js Implementation

```typescript
// src/infrastructure/search/FuseSearchEngine.ts

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
    ignoreLocation: true
  };

  async add(prompt: Prompt): Promise<void> {
    const dto = prompt.toDTO();
    this.prompts.push(dto);
    this.rebuild(this.prompts.map(p => Prompt.reconstitute(p)));
  }

  async update(prompt: Prompt): Promise<void> {
    const index = this.prompts.findIndex(p => p.id === prompt.id.value);
    if (index !== -1) {
      this.prompts[index] = prompt.toDTO();
      this.rebuild(this.prompts.map(p => Prompt.reconstitute(p)));
    }
  }

  async remove(id: PromptId): Promise<void> {
    this.prompts = this.prompts.filter(p => p.id !== id.value);
    this.rebuild(this.prompts.map(p => Prompt.reconstitute(p)));
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.fuse) {
      return [];
    }

    const results = this.fuse.search(query);
    
    return results.map(result => ({
      prompt: Prompt.reconstitute(result.item),
      score: result.score || 0,
      matches: result.matches?.map(match => ({
        key: match.key || '',
        value: match.value || '',
        indices: match.indices || []
      })) || []
    }));
  }

  async rebuild(prompts: Prompt[]): Promise<void> {
    this.prompts = prompts.map(p => p.toDTO());
    this.fuse = new Fuse(this.prompts, this.options);
  }
}
```

### 11.2 Advanced Search with Filters

```typescript
// src/application/use-cases/search/SearchPromptsUseCase.ts

export class SearchPromptsUseCase {
  constructor(
    private readonly searchIndex: ISearchIndex,
    private readonly promptRepository: IPromptRepository
  ) {}

  async execute(request: SearchRequest): Promise<SearchResponse> {
    let results: Prompt[];

    // Step 1: Text search
    if (request.query && request.query.trim().length > 0) {
      const searchResults = await this.searchIndex.search(request.query);
      results = searchResults.map(r => r.prompt);
    } else {
      results = await this.promptRepository.findAll();
    }

    // Step 2: Apply filters
    results = this.applyFilters(results, request.filters);

    // Step 3: Sort
    results = this.sortResults(results, request.sort);

    // Step 4: Paginate
    const paginated = this.paginate(results, request.pagination);

    return {
      prompts: paginated.items,
      total: results.length,
      page: request.pagination?.page || 1,
      hasMore: paginated.hasMore
    };
  }

  private applyFilters(prompts: Prompt[], filters?: SearchFilters): Prompt[] {
    if (!filters) return prompts;

    let filtered = prompts;

    // Filter by folder
    if (filters.folderIds && filters.folderIds.length > 0) {
      filtered = filtered.filter(p =>
        filters.folderIds!.includes(p.folderId.value)
      );
    }

    // Filter by tags (AND logic)
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p =>
        filters.tags!.every(tag =>
          p.tags.some(t => t.value === tag)
        )
      );
    }

    // Filter by platform
    if (filters.platform) {
      filtered = filtered.filter(p =>
        p.metadata.source.platform === filters.platform
      );
    }

    // Filter by date range
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

  private sortResults(prompts: Prompt[], sort?: SearchSort): Prompt[] {
    if (!sort) {
      return prompts.sort((a, b) => 
        b.metadata.createdAt - a.metadata.createdAt
      );
    }

    const { field, order } = sort;
    const multiplier = order === 'asc' ? 1 : -1;

    return prompts.sort((a, b) => {
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
    pagination?: { page: number; limit: number }
  ): { items: Prompt[]; hasMore: boolean } {
    if (!pagination) {
      return { items, hasMore: false };
    }

    const { page, limit } = pagination;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      items: items.slice(start, end),
      hasMore: end < items.length
    };
  }
}
```

---

## 12. Testing Strategy

### 12.1 Test Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /    \  - Critical user flows
     /------\  - Platform integration
    /        \ Integration Tests (30%)
   /          \ - Use cases
  /            \ - Repository + Storage
 /--------------\ Unit Tests (60%)
/                \ - Domain entities
                  \ - Value objects
                  \ - Business logic
```

### 12.2 Unit Tests (Domain Layer)

```typescript
// tests/unit/domain/entities/Prompt.spec.ts

import { describe, it, expect } from 'vitest';
import { Prompt } from '@/domain/entities/Prompt';
import { FolderId } from '@/domain/value-objects/FolderId';
import { Tag } from '@/domain/value-objects/Tag';

describe('Prompt Entity', () => {
  describe('create', () => {
    it('should create a valid prompt', () => {
      const prompt = Prompt.create({
        content: 'Test prompt content',
        folderId: FolderId.generate(),
        tags: [Tag.fromString('test')],
        platform: 'chatgpt'
      });

      expect(prompt.content).toBe('Test prompt content');
      expect(prompt.tags).toHaveLength(1);
    });

    it('should auto-generate title from content', () => {
      const prompt = Prompt.create({
        content: 'This is a long prompt that should be truncated',
        folderId: FolderId.generate(),
        platform: 'chatgpt'
      });

      expect(prompt.title).toBeDefined();
      expect(prompt.title.length).toBeLessThanOrEqual(63);
    });

    it('should throw error for empty content', () => {
      expect(() => {
        Prompt.create({
          content: '',
          folderId: FolderId.generate(),
          platform: 'chatgpt'
        });
      }).toThrow('Content cannot be empty');
    });

    it('should throw error for content exceeding max length', () => {
      const longContent = 'a'.repeat(10001);
      
      expect(() => {
        Prompt.create({
          content: longContent,
          folderId: FolderId.generate(),
          platform: 'chatgpt'
        });
      }).toThrow('Content exceeds maximum length');
    });
  });

  describe('update', () => {
    it('should update prompt fields', () => {
      const original = Prompt.create({
        content: 'Original',
        folderId: FolderId.generate(),
        platform: 'chatgpt'
      });

      const updated = original.update({
        title: 'New Title',
        content: 'New Content'
      });

      expect(updated.title).toBe('New Title');
      expect(updated.content).toBe('New Content');
      expect(updated.id.equals(original.id)).toBe(true);
    });

    it('should mark as updated', () => {
      const original = Prompt.create({
        content: 'Test',
        folderId: FolderId.generate(),
        platform: 'chatgpt'
      });

      const updated = original.update({ title: 'New' });

      expect(updated.metadata.updatedAt).toBeGreaterThan(
        original.metadata.updatedAt
      );
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', () => {
      const prompt = Prompt.create({
        content: 'Test',
        folderId: FolderId.generate(),
        platform: 'chatgpt'
      });

      const used = prompt.incrementUsage();

      expect(used.stats.usedCount).toBe(1);
      expect(used.stats.lastUsedAt).toBeGreaterThan(0);
    });
  });
});
```

### 12.3 Integration Tests (Application Layer)

```typescript
// tests/integration/use-cases/SavePromptUseCase.spec.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { SavePromptUseCase } from '@/application/use-cases/prompt/SavePromptUseCase';
import { InMemoryPromptRepository } from '@/infrastructure/repositories/InMemoryPromptRepository';
import { InMemorySearchIndex } from '@/infrastructure/search/InMemorySearchIndex';
import { InMemoryEventBus } from '@/infrastructure/messaging/InMemoryEventBus';

describe('SavePromptUseCase', () => {
  let useCase: SavePromptUseCase;
  let repository: InMemoryPromptRepository;
  let searchIndex: InMemorySearchIndex;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    repository = new InMemoryPromptRepository();
    searchIndex = new InMemorySearchIndex();
    eventBus = new InMemoryEventBus();
    useCase = new SavePromptUseCase(repository, searchIndex, eventBus);
  });

  it('should save prompt successfully', async () => {
    const request = {
      content: 'Write a professional email',
      folderId: 'default',
      tags: ['email', 'professional'],
      platform: 'chatgpt' as const
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    expect(result.promptId).toBeDefined();

    const saved = await repository.findById(
      new PromptId(result.promptId!)
    );
    expect(saved).not.toBeNull();
    expect(saved!.content).toBe(request.content);
  });

  it('should add prompt to search index', async () => {
    const request = {
      content: 'Explain quantum computing',
      folderId: 'default',
      platform: 'chatgpt' as const
    };

    await useCase.execute(request);

    const results = await searchIndex.search('quantum');
    expect(results.length).toBe(1);
    expect(results[0].prompt.content).toBe(request.content);
  });

  it('should publish PromptSavedEvent', async () => {
    const events: any[] = [];
    eventBus.subscribe((event) => events.push(event));

    await useCase.execute({
      content: 'Test',
      folderId: 'default',
      platform: 'chatgpt'
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(PromptSavedEvent);
  });

  it('should reject duplicate prompts', async () => {
    const request = {
      content: 'Same content',
      folderId: 'default',
      platform: 'chatgpt' as const
    };

    await useCase.execute(request);
    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('duplicate');
  });

  it('should validate content length', async () => {
    const request = {
      content: '',
      folderId: 'default',
      platform: 'chatgpt' as const
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
  });
});
```

### 12.4 E2E Tests (Playwright)

```typescript
// tests/e2e/chatgpt/save-prompt.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ChatGPT - Save Prompt', () => {
  test.beforeEach(async ({ page, context }) => {
    // Load extension
    await context.addInitScript(() => {
      // Mock extension installation
    });

    await page.goto('https://chatgpt.com');
    await page.waitForLoadState('networkidle');
  });

  test('should show save button on user message', async ({ page }) => {
    // Type and send a message
    const input = page.locator('#prompt-textarea');
    await input.fill('Write a haiku about programming');
    await input.press('Enter');

    // Wait for message to appear
    await page.waitForSelector('[data-message-author-role="user"]');

    // Check for save button
    const saveButton = page.locator('.promptpocket-save-btn').first();
    await expect(saveButton).toBeVisible();
  });

  test('should open save dialog on button click', async ({ page }) => {
    // Send a message
    await page.locator('#prompt-textarea').fill('Test prompt');
    await page.locator('#prompt-textarea').press('Enter');

    // Wait for message
    await page.waitForSelector('[data-message-author-role="user"]');

    // Click save button
    await page.locator('.promptpocket-save-btn').first().click();

    // Check dialog
    await expect(page.locator('dialog[open]')).toBeVisible();
    await expect(page.locator('text=Save Prompt')).toBeVisible();
  });

  test('should save prompt with metadata', async ({ page }) => {
    // Send message
    await page.locator('#prompt-textarea').fill('Explain REST APIs');
    await page.locator('#prompt-textarea').press('Enter');
    await page.waitForSelector('[data-message-author-role="user"]');

    // Open save dialog
    await page.locator('.promptpocket-save-btn').first().click();

    // Fill form
    await page.locator('input[name="title"]').fill('REST API Explanation');
    await page.locator('select[name="folder"]').selectOption('Coding');
    
    // Add tags
    await page.locator('input[name="tags"]').fill('api');
    await page.keyboard.press('Enter');
    await page.locator('input[name="tags"]').fill('rest');
    await page.keyboard.press('Enter');

    // Save
    await page.locator('button:has-text("Save Prompt")').click();

    // Verify success
    await expect(page.locator('text=Prompt saved successfully')).toBeVisible();
  });

  test('should insert saved prompt into input', async ({ page }) => {
    // Assume we have a saved prompt
    
    // Open side panel
    await page.locator('.promptpocket-panel-trigger').click();

    // Search for prompt
    await page.locator('input[placeholder="Search prompts..."]').fill('REST');
    await page.waitForTimeout(500); // Debounce

    // Click insert
    await page.locator('.prompt-card').first().locator('button:has-text("Insert")').click();

    // Verify text in input
    const input = page.locator('#prompt-textarea');
    await expect(input).toHaveValue('Explain REST APIs');
  });
});
```

### 12.5 Test Configuration

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'https://chatgpt.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
});
```

---

## 13. Development Workflow

### 13.1 Project Setup

```bash
# Initialize project
npm create vite@latest promptpocket -- --template react-ts
cd promptpocket

# Install dependencies
npm install

# Install UI components
npx shadcn-ui@latest init

# Install additional dependencies
npm install zustand fuse.js lucide-react
npm install -D @types/chrome @playwright/test vitest jsdom

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 13.2 Development Scripts

```json
// package.json

{
  "name": "promptpocket",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:watch": "vite build --watch",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "package": "node scripts/package.ts"
  }
}
```

### 13.3 Vite Configuration

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'side-panel': resolve(__dirname, 'src/side-panel/index.html'),
        'content-script': resolve(__dirname, 'src/content-script/index.tsx'),
        'background': resolve(__dirname, 'src/background/index.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
```

### 13.4 Manifest Configuration

```json
// public/manifest.json

{
  "manifest_version": 3,
  "name": "PromptPocket",
  "version": "1.0.0",
  "description": "Save, organize, and reuse your AI prompts across platforms",
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "permissions": [
    "storage",
    "sidePanel",
    "activeTab"
  ],

  "host_permissions": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*"
  ],

  "background": {
    "service_worker": "background.js"
  },

  "content_scripts": [
    {
      "matches": [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*"
      ],
      "js": ["content-script.js"],
      "css": ["content-script.css"],
      "run_at": "document_end"
    }
  ],

  "side_panel": {
    "default_path": "side-panel.html"
  },

  "action": {
    "default_title": "PromptPocket",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png"
    }
  },

  "web_accessible_resources": [
    {
      "resources": ["assets/*", "chunks/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 13.5 Git Workflow

```bash
# Branch naming
feature/search-implementation
bugfix/save-dialog-validation
refactor/repository-layer
docs/api-documentation

# Commit message format
feat: add fuzzy search to prompt library
fix: resolve input injection on ChatGPT
refactor: extract adapter registry to separate module
docs: update architecture documentation
test: add e2e tests for save flow
```

---

## 14. Deployment & Distribution

### 14.1 Build Process

```typescript
// scripts/build.ts

import { build } from 'vite';
import fs from 'fs-extra';
import archiver from 'archiver';

async function buildExtension() {
  console.log('Building extension...');
  
  // Clean dist
  await fs.remove('dist');
  
  // Build with Vite
  await build();
  
  // Copy manifest
  await fs.copy('public/manifest.json', 'dist/manifest.json');
  
  // Copy icons
  await fs.copy('public/icons', 'dist/icons');
  
  console.log('Build complete!');
}

async function packageExtension() {
  console.log('Packaging extension...');
  
  const output = fs.createWriteStream('promptpocket.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(output);
  archive.directory('dist/', false);
  await archive.finalize();
  
  console.log('Package complete: promptpocket.zip');
}

buildExtension()
  .then(() => packageExtension())
  .catch(console.error);
```

### 14.2 Chrome Web Store Submission

**Checklist:**
- [ ] Tested on latest Chrome
- [ ] All permissions justified
- [ ] Privacy policy written
- [ ] Screenshots prepared (1280x800)
- [ ] Promotional images (440x280)
- [ ] Store listing completed
- [ ] Pricing tier selected (Free)

**Store Listing:**
```
Title: PromptPocket - AI Prompt Manager

Short Description:
Save, organize, and reuse your best AI prompts. Never lose a great prompt again!

Detailed Description:
PromptPocket is your personal library for AI prompts. With one click, save prompts from ChatGPT and other AI platforms, organize them with folders and tags, and find them instantly with powerful search.

Features:
✨ One-click save from chat interfaces
📁 Organize with folders and tags
🔍 Powerful search with filters
🚀 Quick insert into conversations
🔒 100% private - all data stored locally
💼 Perfect for professionals, creators, and students

Get started in seconds - no account required!
```

### 14.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm run test
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: extension-build
          path: dist/

  release:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: extension-build
          path: dist/
      
      - name: Package extension
        run: npm run package
      
      - name: Create release
        uses: softprops/action-gh-release@v1
        with:
          files: promptpocket.zip
          tag_name: v${{ github.run_number }}
```

---

## 15. Security & Privacy

### 15.1 Security Measures

```typescript
// Content Security Policy
const CSP_POLICY = {
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'"]
};

// Input Sanitization
export function sanitizePromptContent(content: string): string {
  // Remove potential XSS vectors
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
}

// Validate URLs
export function isValidSourceURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### 15.2 Privacy Policy

```markdown
# Privacy Policy for PromptPocket

**Last Updated:** January 2026

## Data Collection
PromptPocket does NOT collect, transmit, or share any personal data.

## Local Storage
- All prompts are stored locally on your device
- Data never leaves your browser
- No cloud synchronization (optional in future versions)

## Permissions
- **storage**: To save your prompts locally
- **activeTab**: To detect chat platforms and insert prompts
- **sidePanel**: To display the prompt library

## Third-Party Services
PromptPocket does not use any third-party analytics or tracking services.

## Data Deletion
You can delete all data at any time through Settings > Clear All Data.

## Changes
We will notify users of any privacy policy changes through extension updates.

## Contact
For questions: privacy@promptpocket.app
```

---

## 16. Performance Optimization

### 16.1 Code Splitting

```typescript
// Lazy load heavy components
const PromptEditor = lazy(() => import('./components/PromptEditor'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));

// Route-based splitting
const routes = [
  {
    path: '/library',
    component: lazy(() => import('./pages/Library'))
  },
  {
    path: '/settings',
    component: lazy(() => import('./pages/Settings'))
  }
];
```

### 16.2 Virtual Scrolling

```typescript
// For large prompt lists
import { FixedSizeList } from 'react-window';

function PromptList({ prompts }: { prompts: Prompt[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <PromptCard prompt={prompts[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={prompts.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 16.3 Debouncing & Throttling

```typescript
// Search debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// DOM observer throttle
const throttledCallback = throttle((mutations) => {
  handleMutations(mutations);
}, 200);
```

---

## 17. Error Handling

### 17.1 Error Boundary

```typescript
// src/presentation/components/ErrorBoundary.tsx

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Extension error:', error, errorInfo);
    
    // Log to error tracking service (future)
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Extension
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 17.2 Graceful Degradation

```typescript
// Platform adapter fallback
try {
  const adapter = await registry.detectAndInit();
  if (!adapter) {
    showNotification({
      type: 'info',
      message: 'This platform is not yet supported. You can still manage your library!'
    });
  }
} catch (error) {
  console.error('Adapter initialization failed:', error);
  // Extension still works, just without platform integration
}

// Storage fallback
export class StorageService {
  async save(key: string, value: any): Promise<void> {
    try {
      // Try IndexedDB first
      await this.indexedDB.set(key, value);
    } catch (error) {
      console.warn('IndexedDB failed, using chrome.storage:', error);
      // Fallback to chrome.storage
      await chrome.storage.local.set({ [key]: value });
    }
  }
}
```

### 17.3 User-Friendly Error Messages

```typescript
// src/shared/utils/errorMessages.ts

export const ERROR_MESSAGES = {
  SAVE_FAILED: 'Failed to save prompt. Please try again.',
  DELETE_FAILED: 'Could not delete prompt. Please refresh and retry.',
  SEARCH_FAILED: 'Search temporarily unavailable. Showing all prompts.',
  PLATFORM_UNSUPPORTED: 'This chat platform is not yet supported.',
  STORAGE_QUOTA: 'Storage limit reached. Please delete some prompts.',
  NETWORK_ERROR: 'Network error. Check your connection.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
};

export function getUserFriendlyError(error: Error): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (error instanceof StorageQuotaError) {
    return ERROR_MESSAGES.STORAGE_QUOTA;
  }
  if (error.name === 'QuotaExceededError') {
    return ERROR_MESSAGES.STORAGE_QUOTA;
  }
  return 'An unexpected error occurred. Please try again.';
}
```

---

## 18. Monitoring & Analytics

### 18.1 Anonymous Usage Statistics (Optional)

```typescript
// src/infrastructure/analytics/AnalyticsService.ts

export class AnalyticsService {
  private enabled: boolean = false;

  async init(): Promise<void> {
    // Check user preference
    const settings = await getSettings();
    this.enabled = settings.analytics ?? false;
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.enabled) return;

    // Only track anonymous, aggregated metrics
    const anonymousEvent = {
      type: event.type,
      timestamp: Date.now(),
      // NO user identifiers
      // NO prompt content
      // NO personal data
    };

    this.sendToAnalytics(anonymousEvent);
  }

  private async sendToAnalytics(event: any): Promise<void> {
    // Implementation would go here
    // Could use privacy-focused analytics like Plausible
  }
}

// Example usage
analytics.trackEvent({ type: 'prompt_saved' });
analytics.trackEvent({ type: 'search_performed' });
analytics.trackEvent({ type: 'prompt_inserted' });
```

### 18.2 Performance Monitoring

```typescript
// src/infrastructure/monitoring/PerformanceMonitor.ts

export class PerformanceMonitor {
  measureOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    return fn().finally(() => {
      const duration = performance.now() - start;
      
      if (duration > 1000) {
        console.warn(`Slow operation: ${operation} took ${duration}ms`);
      }
      
      this.recordMetric(operation, duration);
    });
  }

  private recordMetric(operation: string, duration: number): void {
    // Store in local metrics buffer
    const metrics = this.getMetrics();
    metrics.push({ operation, duration, timestamp: Date.now() });
    
    // Keep last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    this.saveMetrics(metrics);
  }

  getSlowOperations(): PerformanceMetric[] {
    return this.getMetrics()
      .filter(m => m.duration > 500)
      .sort((a, b) => b.duration - a.duration);
  }
}
```

---

## 19. Future Roadmap

### 19.1 Phase 1 - MVP (Weeks 1-4)

**Week 1-2: Foundation**
- [ ] Project setup with React + TypeScript + Vite
- [ ] Hexagonal architecture skeleton
- [ ] Domain models (Prompt, Folder, Tag)
- [ ] Basic storage (IndexedDB)
- [ ] Unit tests for domain layer

**Week 3: ChatGPT Integration**
- [ ] ChatGPT adapter implementation
- [ ] Save button UI injection
- [ ] Message detection and extraction
- [ ] Basic insert functionality
- [ ] E2E tests for ChatGPT

**Week 4: Library UI**
- [ ] Side panel setup
- [ ] Prompt list view
- [ ] Basic search (text match)
- [ ] Folder management
- [ ] Tag management
- [ ] Export/Import JSON

### 19.2 Phase 2 - Enhancement (Weeks 5-8)

**Features:**
- [ ] Claude.ai adapter
- [ ] Gemini adapter
- [ ] Advanced search (fuzzy, filters)
- [ ] Prompt statistics (usage count)
- [ ] Quick save (without dialog)
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Multi-language support (i18n)

### 19.3 Phase 3 - Advanced (Weeks 9-12)

**Features:**
- [ ] Prompt templates with variables
- [ ] Prompt optimizer (AI-powered)
- [ ] Collaborative features (share prompt packs)
- [ ] Cloud sync (optional, with auth)
- [ ] Browser extension for Firefox
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

### 19.4 Long-term Vision

**Year 1:**
- Support 10+ AI platforms
- 100K+ active users
- Prompt marketplace (community sharing)
- Team/organization features
- Advanced analytics dashboard

**Year 2:**
- AI-powered prompt suggestions
- Multi-modal prompts (text + images)
- Integration with workflow tools (Zapier, etc.)
- Enterprise version with SSO
- White-label solution for businesses

---

## 20. Appendices

### 20.1 TypeScript Type Definitions

```typescript
// src/shared/types/index.ts

// Domain Types
export type PlatformType = 'chatgpt' | 'claude' | 'gemini' | 'unknown';

export interface PromptDTO {
  id: string;
  title: string;
  content: string;
  folderId: string;
  tags: string[];
  metadata: PromptMetadataDTO;
  stats: PromptStatsDTO;
}

export interface PromptMetadataDTO {
  createdAt: number;
  updatedAt: number;
  source: {
    platform: PlatformType;
    url?: string;
    conversationId?: string;
  };
}

export interface PromptStatsDTO {
  usedCount: number;
  lastUsedAt: number;
}

export interface FolderDTO {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: number;
}

// Request/Response Types
export interface SavePromptRequest {
  content: string;
  title?: string;
  folderId?: string;
  tags?: string[];
  platform: PlatformType;
  url?: string;
  allowDuplicate?: boolean;
}

export interface SavePromptResponse {
  success: boolean;
  promptId?: string;
  prompt?: PromptDTO;
  error?: ErrorDTO;
}

export interface SearchRequest {
  query?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchFilters {
  folderIds?: string[];
  tags?: string[];
  platform?: PlatformType;
  dateFrom?: number;
  dateTo?: number;
}

export interface SearchSort {
  field: 'createdAt' | 'updatedAt' | 'usedCount' | 'title';
  order: 'asc' | 'desc';
}

export interface SearchResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  hasMore: boolean;
}

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

export interface ErrorDTO {
  type: 'validation' | 'duplicate' | 'storage' | 'network' | 'unknown';
  message: string;
  details?: any;
}

// Message Types (Extension Communication)
export type MessageType =
  | 'SAVE_PROMPT'
  | 'GET_PROMPTS'
  | 'SEARCH_PROMPTS'
  | 'INSERT_PROMPT'
  | 'DELETE_PROMPT'
  | 'UPDATE_PROMPT';

export interface ExtensionMessage<T = any> {
  type: MessageType;
  payload: T;
  requestId?: string;
}

export interface ExtensionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

// Settings Types
export interface Settings {
  defaultFolderId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  analytics: boolean;
  notifications: boolean;
  quickSaveEnabled: boolean;
  autoBackup: boolean;
  shortcuts: KeyboardShortcuts;
}

export interface KeyboardShortcuts {
  openPanel: string;
  quickSave: string;
  search: string;
}

// Export/Import Types
export interface ExportData {
  version: string;
  exportedAt: number;
  prompts: PromptDTO[];
  folders: FolderDTO[];
  settings: Settings;
}
```

### 20.2 API Reference

```typescript
// Public API for extension users (future)

/**
 * PromptPocket Public API
 * 
 * This API allows third-party developers to interact with PromptPocket
 * programmatically (future feature).
 */

interface PromptPocketAPI {
  // Prompt Operations
  prompts: {
    save(content: string, metadata?: PromptMetadata): Promise<string>;
    get(id: string): Promise<Prompt | null>;
    search(query: string): Promise<Prompt[]>;
    delete(id: string): Promise<void>;
  };

  // Folder Operations
  folders: {
    create(name: string): Promise<string>;
    list(): Promise<Folder[]>;
    delete(id: string): Promise<void>;
  };

  // Events
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;

  // Utility
  export(): Promise<ExportData>;
  import(data: ExportData): Promise<void>;
}

// Usage example:
// window.promptpocket.prompts.save('Write a blog post about AI');
```

### 20.3 Glossary

| Term | Definition |
|------|------------|
| **Adapter** | Component that translates between platform-specific UI and our application |
| **Artifact** | Generic term for saved items (we use "Prompt" specifically) |
| **Content Script** | JavaScript that runs in the context of web pages |
| **Domain Entity** | Core business object with identity (e.g., Prompt) |
| **Fuzzy Search** | Search that tolerates typos and variations |
| **Hexagonal Architecture** | Architecture pattern that isolates core logic from infrastructure |
| **IndexedDB** | Browser database for large amounts of structured data |
| **Mutation Observer** | API for watching DOM changes |
| **Port** | Interface defining how layers communicate |
| **Side Panel** | Chrome extension UI that appears alongside web content |
| **Use Case** | Single business operation (e.g., SavePrompt) |
| **Value Object** | Immutable object defined by its value (e.g., Tag) |

### 20.4 Common Issues & Solutions

#### Issue: Save button not appearing
**Cause:** Platform adapter not matching current site  
**Solution:** Check `matches()` function, verify URL patterns

#### Issue: Insert not working
**Cause:** Input box selector changed or incorrect event triggering  
**Solution:** Update selectors, ensure proper event dispatch

#### Issue: Slow search
**Cause:** Large prompt library, inefficient search  
**Solution:** Implement pagination, optimize search index

#### Issue: Storage quota exceeded
**Cause:** Too many prompts or large content  
**Solution:** Implement cleanup, compress data, warn users

#### Issue: Duplicate prompts
**Cause:** Timing issue with async saves  
**Solution:** Add unique constraint check, debounce save

### 20.5 Contributing Guidelines

```markdown
# Contributing to PromptPocket

We welcome contributions! Please follow these guidelines:

## Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the code style (ESLint + Prettier)
4. Write tests for new features
5. Update documentation

## Code Standards
- Use TypeScript strictly (no `any` types)
- Follow hexagonal architecture principles
- Write unit tests (aim for 80%+ coverage)
- Add JSDoc comments for public APIs
- Keep components under 200 lines

## Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code change without feature/fix
- `test:` Adding tests
- `docs:` Documentation only

## Pull Request Process
1. Update README.md with changes
2. Add tests and ensure all pass
3. Update CHANGELOG.md
4. Request review from maintainers
5. Squash commits before merge

## Adding Platform Adapters
See `/docs/ADAPTER_GUIDE.md` for detailed instructions on creating new platform adapters.
```

### 20.6 Resources & References

**Documentation:**
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

**Libraries:**
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Fuse.js](https://fusejs.io)
- [Playwright](https://playwright.dev)

**Tools:**
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)

---

## Conclusion

This documentation provides a **complete blueprint** for building PromptPocket as a professional-grade browser extension. The hexagonal architecture ensures:

✅ **Testability** - Every layer can be tested independently  
✅ **Maintainability** - Clear separation of concerns  
✅ **Scalability** - Easy to add new platforms and features  
✅ **Flexibility** - Swap implementations without touching core logic  
✅ **Quality** - Professional standards from day one  

### Next Steps

1. **Review** this documentation with your team
2. **Set up** the development environment
3. **Create** the project structure
4. **Implement** Phase 1 (MVP) following the roadmap
5. **Test** thoroughly with unit, integration, and E2E tests
6. **Deploy** to Chrome Web Store

### Support

For questions or clarifications about this documentation:
- Create an issue in the project repository
- Contact the architecture team
- Refer to inline code comments

---

**Document Version:** 1.0.0  
**Last Updated:** January 24, 2026  
**Maintained by:** PromptPocket Team

---

## Document Metadata

- **Total Sections:** 20
- **Word Count:** ~15,000
- **Code Examples:** 50+
- **Diagrams:** 5
- **Completeness:** Production-Ready
- **Audience:** Senior Developers, Architects, Product Managers
  