# PromptPocket - Setup Instructions

## Quick Start

### 1. Create Project Structure

```bash
# Create project directory
mkdir promptpocket
cd promptpocket

# Copy all files from artifacts to appropriate locations
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18 + React DOM
- TypeScript 5
- Vite 5
- Zustand (state management)
- Fuse.js (search engine)
- Tailwind CSS + shadcn/ui components
- Lucide React (icons)
- Testing libraries (Vitest, Playwright)

### 3. Project Structure

Make sure you have this structure:

```
promptpocket/
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Prompt.ts
│   │   │   └── Folder.ts
│   │   └── value-objects/
│   │       ├── PromptId.ts
│   │       ├── FolderId.ts
│   │       ├── Tag.ts
│   │       ├── PromptMetadata.ts
│   │       └── PromptStats.ts
│   ├── application/
│   │   ├── ports/
│   │   │   └── output/
│   │   │       ├── IPromptRepository.ts
│   │   │       ├── IFolderRepository.ts
│   │   │       ├── ISearchIndex.ts
│   │   │       └── IPlatformAdapter.ts
│   │   ├── dto/
│   │   │   ├── SavePromptRequest.ts
│   │   │   └── SearchPromptsRequest.ts
│   │   └── use-cases/
│   │       ├── prompt/
│   │       │   ├── SavePromptUseCase.ts
│   │       │   └── GetAllPromptsUseCase.ts
│   │       └── search/
│   │           └── SearchPromptsUseCase.ts
│   ├── infrastructure/
│   │   ├── storage/
│   │   │   └── IndexedDBService.ts
│   │   ├── repositories/
│   │   │   ├── IndexedDBPromptRepository.ts
│   │   │   └── IndexedDBFolderRepository.ts
│   │   ├── search/
│   │   │   └── FuseSearchEngine.ts
│   │   ├── platform-adapters/
│   │   │   ├── base/
│   │   │   │   ├── BasePlatformAdapter.ts
│   │   │   │   └── AdapterRegistry.ts
│   │   │   └── chatgpt/
│   │   │       └── ChatGPTAdapter.ts
│   │   └── di/
│   │       ├── Container.ts
│   │       └── setup.ts
│   ├── presentation/
│   │   ├── stores/
│   │   │   └── promptStore.ts
│   │   └── pages/
│   │       └── Library.tsx
│   ├── content-script/
│   │   ├── index.tsx
│   │   ├── components/
│   │   │   └── SaveButton.tsx
│   │   └── styles.css
│   ├── background/
│   │   └── index.ts
│   ├── side-panel/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── styles.css
│   └── shared/
│       └── types/
│           └── index.ts
├── side-panel.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

### 4. Add Icons

Create placeholder icons in `public/icons/`:

You need:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

You can use any bookmark/pocket icon or generate them.

### 5. Development

```bash
# Start development server
npm run dev
```

This will:
- Start Vite dev server
- Watch for file changes
- Build extension files to `dist/`

### 6. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your project
5. The extension should now appear in your extensions list

### 7. Test the Extension

1. Go to https://chatgpt.com
2. Send a message
3. You should see a "Save" button appear on your message
4. Click the extension icon to open the side panel
5. Your saved prompts should appear in the library

## Common Issues & Solutions

### Issue: Module not found errors

**Solution**: Make sure all path aliases in `tsconfig.json` match your folder structure.

### Issue: Extension not loading

**Solution**: 
1. Check `dist/manifest.json` exists
2. Check browser console for errors
3. Try "Reload" button in chrome://extensions

### Issue: Save button not appearing

**Solution**:
1. Check browser console in ChatGPT page
2. Verify content script is injected
3. Check if platform adapter is matching

### Issue: Storage errors

**Solution**: 
1. Clear extension data from `chrome://extensions/`
2. Check IndexedDB in DevTools
3. Verify permissions in manifest.json

## Next Steps

### MVP Features to Add:
1. ✅ Save prompt from ChatGPT
2. ✅ View prompts in library
3. ⬜ Search prompts
4. ⬜ Add folders
5. ⬜ Add tags
6. ⬜ Insert prompt into chat
7. ⬜ Edit/delete prompts
8. ⬜ Export/import data

### Phase 2:
1. Claude.ai adapter
2. Gemini adapter
3. Advanced search with filters
4. Prompt statistics
5. Dark mode

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build:watch      # Watch mode for build

# Testing
npm test                 # Run unit tests
npm run test:ui          # Test UI
npm run test:e2e         # E2E tests

# Code Quality
npm run lint             # Lint code
npm run format           # Format with Prettier
npm run type-check       # Check TypeScript types

# Build
npm run build            # Production build
npm run preview          # Preview production build
```

## Need Help?

1. Check the main `README.md`
2. Review the architecture documentation
3. Look at existing code examples
4. Check browser console for errors

## License

MIT
