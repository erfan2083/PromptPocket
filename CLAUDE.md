# CLAUDE.md - PromptPocket Development Guide

## Project Overview

PromptPocket is a Chrome browser extension for saving, organizing, and reusing AI prompts. Built with Hexagonal Architecture (Ports & Adapters), React 18, TypeScript 5, and Vite 5.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Type-check + build to dist/
npm run type-check   # TypeScript type checking only
npm run lint         # ESLint
npm run test         # Vitest unit tests
```

After building, load `dist/` as an unpacked Chrome extension at `chrome://extensions`.

## Architecture

**Hexagonal Architecture** - Dependencies point inward only: `Infrastructure → Application → Domain`

- **Domain** (`src/domain/`) - Pure business logic, zero external dependencies. Entities: `Prompt`, `Folder`. Value Objects: `PromptId`, `FolderId`, `Tag`, `PromptMetadata`, `PromptStats`.
- **Application** (`src/application/`) - Use cases and port interfaces. Use cases: `SavePromptUseCase`, `GetAllPromptsUseCase`, `SearchPromptsUseCase`, `DeletePromptUseCase`. Ports in `ports/output/`.
- **Infrastructure** (`src/infrastructure/`) - Adapters implementing ports. IndexedDB repos, Fuse.js search, platform adapters, DI container.
- **Presentation** (`src/presentation/`) - React UI with Zustand state management.

## Key Entry Points

| Entry Point | File | Output |
|---|---|---|
| Side Panel UI | `src/side-panel/index.tsx` | `side-panel.html` |
| Content Script | `src/content-script/index.tsx` | `content-script.js` |
| Background Worker | `src/background/index.ts` | `background.js` |

## Path Aliases

Defined in `tsconfig.json` and `vite.config.ts`:

- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`
- `@shared/*` → `src/shared/*`

## File Naming Conventions

- **Components**: PascalCase `.tsx` (e.g., `Library.tsx`, `SaveButton.tsx`)
- **Domain entities/VOs**: PascalCase `.ts` (e.g., `Prompt.ts`, `PromptId.ts`)
- **Ports/Interfaces**: PascalCase with `I` prefix (e.g., `IPromptRepository.ts`)
- **Use Cases**: PascalCase (e.g., `SavePromptUseCase.ts`)
- **Config files**: Standard names (`tsconfig.json`, `vite.config.ts`, `tailwind.config.js`)

## DI Container

Services are registered in `src/infrastructure/di/setup.ts`. Access via:
```typescript
import { getContainer } from '@infrastructure/di';
const container = getContainer();
const useCase = container.resolve<SavePromptUseCase>('SavePromptUseCase');
```

## Tech Stack

- React 18, TypeScript 5, Vite 5
- Zustand (state), Fuse.js (search), Tailwind CSS (styling), Lucide React (icons)
- IndexedDB (storage), Chrome Extension MV3
- ESLint + Prettier (code quality)

## Extension Communication

Content script and side panel communicate with the background service worker via `chrome.runtime.sendMessage`. Message types: `SAVE_PROMPT`, `GET_PROMPTS`, `SEARCH_PROMPTS`, `DELETE_PROMPT`.

## Platform Adapters

Extensible adapter system in `src/infrastructure/platform-adapters/`. Currently supports ChatGPT. New platforms: extend `BasePlatformAdapter` and register in `AdapterRegistry`.
