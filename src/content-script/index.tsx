import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdapterRegistry } from '@infrastructure/platform-adapters/base/AdapterRegistry';
import { ChatGPTAdapter } from '@infrastructure/platform-adapters/chatgpt/ChatGPTAdapter';
import { SaveButton } from './components/SaveButton';
import './styles.css';

console.log('[PromptPocket] Content script loaded');

class ContentScriptApp {
  private registry: AdapterRegistry;
  private injectedButtons = new Map<HTMLElement, ReactDOM.Root>();

  constructor() {
    this.registry = new AdapterRegistry();
    this.registry.register(new ChatGPTAdapter());
  }

  async init() {
    try {
      const adapter = await this.registry.detectAndInit();
      
      if (!adapter) {
        console.log('[PromptPocket] No compatible platform detected');
        return;
      }

      console.log(`[PromptPocket] Initialized on ${adapter.name}`);

      // Inject save buttons on existing messages
      this.injectButtonsOnExistingMessages();

      // ChatGPT loads conversation messages asynchronously,
      // so re-scan a few times after initial load
      for (const delay of [1000, 3000, 6000]) {
        setTimeout(() => this.injectButtonsOnExistingMessages(), delay);
      }

      // Listen for new messages
      adapter.onNewMessage((messageElement) => {
        this.injectSaveButton(messageElement);
      });

    } catch (error) {
      console.error('[PromptPocket] Initialization error:', error);
    }
  }

  private injectButtonsOnExistingMessages() {
    const adapter = this.registry.getActive();
    if (!adapter) return;

    const messages = adapter.getUserMessages();
    messages.forEach(msg => this.injectSaveButton(msg));
  }

  private injectSaveButton(messageElement: HTMLElement) {
    // Check if already injected
    if (this.injectedButtons.has(messageElement)) {
      return;
    }

    const adapter = this.registry.getActive();
    if (!adapter) return;

    // Create container for React component
    const container = document.createElement('div');
    container.className = 'promptpocket-button-container';

    // Try to find the action bar for this message (ChatGPT-style injection)
    let injectionTarget: HTMLElement = messageElement;
    let useActionBarStyle = false;

    if (adapter.getActionBar) {
      const actionBar = adapter.getActionBar(messageElement);
      if (actionBar) {
        injectionTarget = actionBar;
        useActionBarStyle = true;
        container.className = 'promptpocket-button-container promptpocket-actionbar';
      }
    }

    // Fallback: position absolutely on the message element
    if (!useActionBarStyle) {
      if (getComputedStyle(messageElement).position === 'static') {
        messageElement.style.position = 'relative';
      }
    }

    injectionTarget.appendChild(container);

    const content = adapter.getMessageText(messageElement);
    const platform = adapter.platform;
    const url = window.location.href;

    // Render React component
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <SaveButton
          content={content}
          platform={platform}
          url={url}
          compact={useActionBarStyle}
        />
      </React.StrictMode>
    );

    this.injectedButtons.set(messageElement, root);
  }

  destroy() {
    // Cleanup
    this.injectedButtons.forEach(root => root.unmount());
    this.injectedButtons.clear();
    this.registry.destroy();
  }
}

// Initialize app
const app = new ContentScriptApp();
app.init();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  app.destroy();
});
