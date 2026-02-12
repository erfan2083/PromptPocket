# PromptPocket

A Chrome browser extension for saving, organizing, and reusing AI prompts across platforms. Features one-click saving from ChatGPT and Gemini, fuzzy search, folder/tag organization, and optional Firebase cloud sync with a companion mobile app.

## Features

- **One-Click Save** - Save prompts directly from ChatGPT and Google Gemini with injected save buttons
- **Smart Organization** - Organize prompts with folders, tags, and auto-generated titles
- **Fuzzy Search** - Find prompts instantly with Fuse.js-powered full-text search, filters, and sorting
- **Cloud Sync** - Optional Firebase sync across devices with email or Google sign-in
- **Mobile App** - Companion React Native (Expo) app shares prompts via the same Firebase backend
- **Privacy First** - All data stored locally in IndexedDB by default; sync is opt-in
- **Extensible** - Hexagonal architecture with a platform adapter system for adding new AI sites

## Supported Platforms

| Platform | Status |
|---|---|
| ChatGPT (`chatgpt.com`, `chat.openai.com`) | Supported |
| Google Gemini (`gemini.google.com`) | Supported |
| Claude | Planned |

## Architecture

Built with **Hexagonal Architecture** (Ports & Adapters):

```
src/
├── domain/              # Core business logic (entities, value objects)
├── application/         # Use cases and port interfaces
├── infrastructure/      # Adapters (IndexedDB, Fuse.js, Firebase, platform adapters)
├── presentation/        # React components, Zustand stores, pages
├── content-script/      # Injected save buttons on AI platforms
├── background/          # Service worker (message routing, sync)
├── side-panel/          # Chrome side panel UI
└── shared/              # Shared types and constants
```

## Tech Stack

- **UI**: React 18, TypeScript 5, Tailwind CSS 3.4, Lucide React
- **Build**: Vite 5 (multi-target: side panel, content script, background worker)
- **State**: Zustand
- **Search**: Fuse.js (fuzzy search)
- **Storage**: IndexedDB (local), Firebase Firestore (cloud sync, optional)
- **Auth**: Firebase Auth (email/password + Google OAuth)
- **Platform**: Chrome Extension Manifest V3
- **Testing**: Vitest, @testing-library/react, Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repository-url>
cd promptpocket
npm install
```

### Development

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + multi-target build to dist/
npm run type-check   # TypeScript type checking only
npm run lint         # ESLint (zero warnings allowed)
npm run format       # Prettier formatting
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
```

### Load in Chrome

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder

### Cloud Sync Setup (Optional)

Cloud sync requires a Firebase project. To enable it:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore and Authentication (Email/Password and Google providers)
3. Copy `.env.example` to `.env` and fill in your Firebase credentials
4. For Google sign-in, create a Chrome Extension OAuth 2.0 client ID in Google Cloud Console
5. Update `oauth2.client_id` in `public/manifest.json` with your client ID
6. Rebuild the extension

Without these variables, the extension works fully offline with local IndexedDB storage.

## Adding a New Platform Adapter

1. Create a directory in `src/infrastructure/platform-adapters/<platform>/`
2. Extend `BasePlatformAdapter`
3. Implement `matches()`, `getSelectors()`, `getActionBar()`, and other required methods
4. Register the adapter in `src/infrastructure/di/setup.ts`
5. Add the platform's URL to `host_permissions` and `content_scripts.matches` in `public/manifest.json`

## Mobile App

A companion React Native (Expo) app lives in `mobile/`. It connects to the same Firebase backend for cross-device sync. See `mobile/` for setup instructions.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check + production build |
| `npm run type-check` | TypeScript type checking only |
| `npm run lint` | ESLint with zero warnings policy |
| `npm run format` | Prettier formatting |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:ui` | Run tests with browser UI |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT
