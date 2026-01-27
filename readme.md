# PromptPocket

A professional browser extension for saving, organizing, and reusing AI prompts across platforms.

## 🚀 Features

- **One-Click Save**: Save prompts directly from ChatGPT and other AI chat platforms
- **Smart Organization**: Organize with folders and tags
- **Powerful Search**: Find prompts instantly with fuzzy search
- **Privacy First**: All data stored locally on your device
- **Platform Agnostic**: Extensible architecture for multiple AI platforms

## 🏗️ Architecture

This project uses **Hexagonal Architecture** (Ports & Adapters) for:
- Clean separation of concerns
- Easy testing and maintenance
- Platform-agnostic core logic
- Flexible implementation swapping

### Project Structure

```
src/
├── domain/              # Core business logic (no dependencies)
├── application/         # Use cases and ports
├── infrastructure/      # External adapters (DB, API, UI)
├── presentation/        # React components and pages
├── content-script/      # Content script entry
├── background/          # Service worker
└── side-panel/          # Side panel UI
```

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Search**: Fuse.js
- **Storage**: IndexedDB
- **Testing**: Vitest + Playwright

## 📦 Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# E2E tests
npm run test:e2e
```

## 🔧 Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd promptpocket
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development**
```bash
npm run dev
```

4. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🏗️ Adding a New Platform Adapter

1. Create adapter in `src/infrastructure/platform-adapters/[platform]/`
2. Extend `BasePlatformAdapter`
3. Implement required methods
4. Register in `AdapterRegistry`

Example:
```typescript
export class ClaudeAdapter extends BasePlatformAdapter {
  readonly name = 'Claude';
  readonly platform = 'claude';
  
  matches(): boolean {
    return window.location.hostname.includes('claude.ai');
  }
  
  // ... implement other methods
}
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:ui

# E2E tests
npm run test:e2e
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT

## 🙏 Credits

Built with ❤️ using modern web technologies
