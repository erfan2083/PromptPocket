import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isContentScript = process.env.BUILD_TARGET === 'content-script';
const isBackground = process.env.BUILD_TARGET === 'background';
const isSidePanel = !isContentScript && !isBackground;

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@domain': resolve(__dirname, './src/domain'),
      '@application': resolve(__dirname, './src/application'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@presentation': resolve(__dirname, './src/presentation'),
      '@shared': resolve(__dirname, './src/shared'),
    }
  },

  build: {
    outDir: 'dist',
    emptyOutDir: isSidePanel,
    rollupOptions: {
      input: isContentScript
        ? { 'content-script': resolve(__dirname, 'src/content-script/index.tsx') }
        : isBackground
          ? { 'background': resolve(__dirname, 'src/background/index.ts') }
          : { 'side-panel': resolve(__dirname, 'side-panel.html') },
      output: {
        format: (isContentScript || isBackground) ? 'iife' : undefined,
        inlineDynamicImports: isContentScript || isBackground,
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content-script' || chunkInfo.name === 'background') {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
