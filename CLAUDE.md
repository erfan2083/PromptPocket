# CLAUDE.md - PromptPocket Development Guide

## Project Overview

PromptPocket is a Chrome browser extension (Manifest V3) for saving, organizing, and reusing AI prompts. Built with Hexagonal Architecture (Ports & Adapters), React 18, TypeScript 5, and Vite 5. Includes optional Firebase cloud sync and a companion React Native mobile app.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Type-check + multi-target build to dist/
npm run type-check   # TypeScript type checking only
npm run lint         # ESLint (zero warnings allowed)
npm run format       # Prettier formatting
npm run test         # Vitest unit tests
npm run test:ui      # Vitest with browser UI
npm run test:e2e     # Playwright end-to-end tests
```

After building, load `dist/` as an unpacked Chrome extension at `chrome://extensions` (enable Developer mode).

### Build Process

The build is a multi-step pipeline (see `package.json` `build` script):
1. `tsc` - TypeScript type checking
2. `vite build` - Side panel (default target)
3. `BUILD_TARGET=content-script vite build` - Content script (IIFE)
4. `BUILD_TARGET=background vite build` - Background worker (IIFE)
5. Copy `manifest.json` and `content-script.css` to `dist/`

Content script and background builds use IIFE format for self-contained execution. Uses `cross-env` and `shx` for cross-platform compatibility.

### Environment Variables

Firebase cloud sync requires environment variables. Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_CLIENT_ID=
```

Sync is optional — the extension works fully offline without Firebase configured.

## Architecture

**Hexagonal Architecture** - Dependencies point inward only: `Infrastructure → Application → Domain`

```
┌─────────────────────────────────────────────────┐
│  Presentation (React UI, Zustand stores)        │
├─────────────────────────────────────────────────┤
│  Infrastructure (IndexedDB, Fuse.js, Adapters)  │
├─────────────────────────────────────────────────┤
│  Application (Use Cases, Port Interfaces)       │
├─────────────────────────────────────────────────┤
│  Domain (Entities, Value Objects)                │
└─────────────────────────────────────────────────┘
```

- **Domain** (`src/domain/`) - Pure business logic, zero external dependencies. Entities are immutable (Object.freeze after creation).
- **Application** (`src/application/`) - Use cases orchestrate domain logic. Port interfaces define contracts for infrastructure.
- **Infrastructure** (`src/infrastructure/`) - Adapters implementing ports: IndexedDB repos, Fuse.js search, Firebase sync, platform adapters, DI container.
- **Presentation** (`src/presentation/`) - React UI with Zustand state management.

## Source Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── Prompt.ts              # Core entity: id, title, content, folderId, tags, metadata, stats
│   │   └── Folder.ts              # Folder entity with color support and "default" folder
│   └── value-objects/
│       ├── PromptId.ts            # UUID v4 validated ID
│       ├── FolderId.ts            # String ID, supports "default"
│       ├── Tag.ts                 # Lowercase, 1-30 chars, alphanum + hyphens/underscores
│       ├── PromptMetadata.ts      # createdAt, updatedAt, platform source
│       └── PromptStats.ts         # usedCount, lastUsedAt
├── application/
│   ├── use-cases/
│   │   ├── SavePromptUseCase.ts   # Validate, check duplicates, create, persist, index
│   │   ├── GetAllPromptsUseCase.ts # Retrieve all, sort newest-first
│   │   ├── SearchPromptsUseCase.ts # Full-text search with filters/sort/pagination
│   │   ├── DeletePromptUseCase.ts  # Delete from repo and search index
│   │   ├── UpdatePromptUseCase.ts  # Update existing prompt fields
│   │   └── SyncPromptsUseCase.ts   # Bidirectional cloud sync orchestration
│   ├── ports/output/
│   │   ├── IPromptRepository.ts   # CRUD + queries by folder/tags
│   │   ├── IFolderRepository.ts   # CRUD for folders
│   │   ├── ISearchIndex.ts        # Search: add, update, remove, search, rebuild
│   │   ├── IPlatformAdapter.ts    # Platform detection and DOM interaction
│   │   └── ISyncService.ts        # Cloud sync: push, pull, full sync, real-time changes
│   └── dto/
│       ├── SavePromptRequest.ts   # Input DTO with optional duplicate check
│       └── SearchPromptsRequest.ts # Query, filters, sort, pagination
├── infrastructure/
│   ├── di/
│   │   ├── Container.ts           # Lightweight DI: registerSingleton/register/resolve
│   │   ├── setup.ts               # Bootstrap: registers all services
│   │   └── index.ts               # Exports getContainer(), setupDI()
│   ├── storage/
│   │   └── IndexedDBService.ts    # DB wrapper: "PromptPocketDB" v1
│   ├── repositories/
│   │   ├── IndexedDBPromptRepository.ts
│   │   └── IndexedDBFolderRepository.ts
│   ├── search/
│   │   └── FuseSearchEngine.ts    # Fuse.js: title(0.4), content(0.5), tags(0.1), threshold 0.3
│   ├── sync/
│   │   ├── FirebaseSyncService.ts # Firebase Firestore sync with auth (email + Google)
│   │   └── firebase-config.ts     # Firebase config from env vars, isFirebaseConfigured()
│   └── platform-adapters/
│       ├── base/
│       │   ├── BasePlatformAdapter.ts  # Abstract: MutationObserver, DOM helpers
│       │   └── AdapterRegistry.ts      # Registry for platform adapters
│       ├── chatgpt/
│       │   └── ChatGPTAdapter.ts       # ChatGPT/OpenAI adapter
│       └── gemini/
│           └── GeminiAdapter.ts        # Google Gemini adapter
├── presentation/
│   ├── components/
│   │   └── SyncPanel.tsx          # Cloud sync UI: sign in, status, manual sync
│   ├── stores/
│   │   ├── promptStore.ts         # Zustand: prompts[], isLoading, error, actions
│   │   └── syncStore.ts           # Zustand: sync state, sign in/out, sync triggers
│   └── pages/
│       └── Library.tsx            # Main UI: search, create, list, copy, delete
├── content-script/
│   ├── index.tsx                  # Entry: injects save buttons into supported platforms
│   ├── components/
│   │   └── SaveButton.tsx         # Toggle save/unsave with context invalidation handling
│   └── styles.css                 # Content script styles
├── side-panel/
│   ├── index.tsx                  # React root entry
│   ├── App.tsx                    # App wrapper with DI initialization
│   └── styles.css                 # Tailwind + custom scrollbar styles
├── background/
│   └── index.ts                   # Message handler, DI init, side panel opener, sync restore
└── shared/
    └── types/
        └── index.ts               # Shared types: messages, search, settings, platform
```

### Mobile App

A companion React Native (Expo) mobile app lives in `mobile/`. It shares the same Firebase backend for cross-device prompt sync. See `mobile/` for its own setup and build instructions.

## Key Entry Points

| Entry Point | File | Output | Role |
|---|---|---|---|
| Side Panel UI | `src/side-panel/index.tsx` | `side-panel.html` | Prompt library management |
| Content Script | `src/content-script/index.tsx` | `content-script.js` | Injects save buttons into AI platforms |
| Background Worker | `src/background/index.ts` | `background.js` | Message routing, use case execution, sync |

## Extension Communication

```
Content Script ──sendMessage──▶ Background ──broadcast──▶ Side Panel
    SaveButton                    handleMessage()           Library
    (SAVE_PROMPT)                 (resolves use cases)      (listens PROMPTS_UPDATED)
    (DELETE_PROMPT)               (broadcasts changes)
```

**Active message types** (handled in background):
- `SAVE_PROMPT` - Save a prompt, broadcasts `PROMPTS_UPDATED` on success
- `GET_PROMPTS` - Retrieve all prompts (sorted newest-first)
- `SEARCH_PROMPTS` - Full-text search with filters/pagination
- `UPDATE_PROMPT` - Update an existing prompt's fields
- `DELETE_PROMPT` - Delete a prompt, broadcasts `PROMPTS_UPDATED` on success
- `SYNC_SIGN_IN` - Sign in with email/password, triggers initial full sync
- `SYNC_GOOGLE_SIGN_IN` - Sign in with Google OAuth via `chrome.identity`
- `SYNC_SIGN_OUT` - Sign out and disable sync
- `SYNC_NOW` - Trigger a manual full sync
- `SYNC_STATUS` - Get current sync status and authenticated email

**Defined but not yet implemented**: `GET_PROMPT`, `INSERT_PROMPT`, `GET_FOLDERS`, `CREATE_FOLDER`, `UPDATE_FOLDER`, `DELETE_FOLDER`

**Side panel** resolves use cases directly from the DI container (no messaging needed).

## DI Container

Services registered in `src/infrastructure/di/setup.ts`. Registration order:

```
IndexedDBService (singleton)
  → IndexedDBPromptRepository (singleton, as 'IPromptRepository')
  → IndexedDBFolderRepository (singleton, as 'IFolderRepository')
  → FuseSearchEngine (singleton, as 'ISearchIndex')
  → AdapterRegistry (singleton, with ChatGPTAdapter + GeminiAdapter)
  → FirebaseSyncService (singleton, as 'ISyncService')
    → SavePromptUseCase
    → GetAllPromptsUseCase
    → SearchPromptsUseCase
    → DeletePromptUseCase
    → UpdatePromptUseCase
    → SyncPromptsUseCase
```

Usage:
```typescript
import { getContainer } from '@infrastructure/di';
const container = getContainer();
const useCase = container.resolve<SavePromptUseCase>('SavePromptUseCase');
```

## Cloud Sync

Optional Firebase-based cloud sync enables bidirectional prompt synchronization across devices (extension + mobile app).

**Architecture**: `SyncPromptsUseCase` orchestrates sync via the `ISyncService` port. `FirebaseSyncService` implements it using Firebase Firestore for data and Firebase Auth for identity.

**Firestore schema**: `users/{uid}/prompts/{id}` and `users/{uid}/folders/{id}`

**Auth methods**: Email/password and Google OAuth (via `chrome.identity` API).

**Sync behavior**:
- On sign-in: performs full bidirectional sync, then starts real-time Firestore listeners
- On save/update/delete: pushes changes to Firestore if sync is enabled
- On background startup: restores persisted auth session from `chrome.storage.local` and re-syncs
- Real-time: `onSnapshot` listeners propagate remote changes to local IndexedDB

**Sync is optional**: If Firebase env vars are not set, `isFirebaseConfigured()` returns false and all sync operations are no-ops.

## Path Aliases

Defined in both `tsconfig.json` and `vite.config.ts`:

- `@/*` → `src/*`
- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`
- `@shared/*` → `src/shared/*`

## Platform Adapters

Extensible adapter system in `src/infrastructure/platform-adapters/`.

**Currently supported**:
- ChatGPT (`chatgpt.com`, `chat.openai.com`)
- Gemini (`gemini.google.com`)

**ChatGPT adapter features**:
- Injects save button into ChatGPT's action bar (alongside Copy/Edit buttons)
- Fallback: absolute positioning on message if action bar not found
- MutationObserver with retry mechanism (up to 15 retries, 2-second intervals)
- Dark mode support via media queries and class-based detection
- Toggle save/unsave behavior

**Gemini adapter features**:
- Injects save button into Gemini's user query action area
- Targets `user-query` custom elements and the "Copy prompt" button container
- Material Design-style circular button matching Gemini's UI
- Dark mode support via `prefers-color-scheme`, `data-theme`, and class-based detection

**Adding a new platform**: Extend `BasePlatformAdapter`, implement platform-specific selectors and injection logic, register in `AdapterRegistry` (in `setup.ts`). Planned: Claude.

## Domain Rules

- **Prompt**: Content required (max 10,000 chars), max 20 tags, title max 200 chars. Auto-generates title from first 60 chars of content if not provided.
- **Folder**: Name required (max 50 chars). Default folder has ID `"default"`. Auto-assigns color from predefined palette.
- **Tag**: Lowercase only, 1-30 chars, alphanumeric with hyphens/underscores/spaces.
- **PromptId**: Must be valid UUID v4.
- All domain entities are **immutable** (frozen via `Object.freeze` after creation).

## IndexedDB Schema

Database: `PromptPocketDB`, version 1

| Store | Key Path | Indexes |
|---|---|---|
| `prompts` | `id` | `folderId`, `createdAt`, `updatedAt` |
| `folders` | `id` | `name` |

## File Naming Conventions

- **React Components**: PascalCase `.tsx` (`Library.tsx`, `SaveButton.tsx`, `SyncPanel.tsx`)
- **Domain entities/VOs**: PascalCase `.ts` (`Prompt.ts`, `PromptId.ts`)
- **Port interfaces**: PascalCase with `I` prefix (`IPromptRepository.ts`, `ISyncService.ts`)
- **Use Cases**: PascalCase with `UseCase` suffix (`SavePromptUseCase.ts`, `SyncPromptsUseCase.ts`)
- **Stores**: camelCase `.ts` (`promptStore.ts`, `syncStore.ts`)
- **Config files**: Standard names (`tsconfig.json`, `vite.config.ts`, `tailwind.config.js`)

## Tech Stack

- **UI**: React 18, Tailwind CSS 3.4, Lucide React (icons), class-variance-authority + clsx + tailwind-merge
- **Language**: TypeScript 5.3 (strict mode)
- **Build**: Vite 5, PostCSS, Autoprefixer
- **State**: Zustand 4.4
- **Search**: Fuse.js 7 (fuzzy search)
- **Storage**: IndexedDB (via custom wrapper)
- **Sync**: Firebase 11 (Firestore + Auth), optional
- **Platform**: Chrome Extension Manifest V3
- **Code quality**: ESLint 8 + Prettier 3
- **Testing**: Vitest 1.1, @testing-library/react, Playwright (configured, no tests written yet)

## Code Style

- **ESLint**: Zero warnings policy (`--max-warnings 0`)
- **Prettier**: Single quotes, trailing commas (es5), semicolons, 100 char width, 2-space indent
- **TypeScript**: `@typescript-eslint/no-explicit-any` is a warning; unused vars with `_` prefix are allowed
- **Exports**: Use named exports; barrel files (`index.ts`) for public APIs

## Chrome Extension Permissions

- `storage` - Chrome storage API
- `sidePanel` - Side panel API
- `identity` - Google OAuth for cloud sync
- Host permissions: `https://chatgpt.com/*`, `https://chat.openai.com/*`, `https://gemini.google.com/*`
- OAuth2 scopes: `openid`, `email`, `profile`
