import { BasePlatformAdapter } from '../base/BasePlatformAdapter';
import { PlatformType, PlatformSelectors } from '@shared/types';

export class ChatGPTAdapter extends BasePlatformAdapter {
  readonly name = 'ChatGPT';
  readonly platform: PlatformType = 'chatgpt';

  matches(): boolean {
    return window.location.hostname.includes('chatgpt.com') ||
      window.location.hostname.includes('chat.openai.com');
  }

  getSelectors(): PlatformSelectors {
    return {
      messagesContainer: 'main',
      userMessage: '[data-message-author-role="user"]',
      assistantMessage: '[data-message-author-role="assistant"]',
      messageText: '.whitespace-pre-wrap, .markdown, [data-message-author-role] .relative',
      inputBox: '#prompt-textarea, [contenteditable="true"]'
    };
  }

  isUserMessage(element: HTMLElement): boolean {
    if (
      element.hasAttribute('data-message-author-role') &&
      element.getAttribute('data-message-author-role') === 'user'
    ) {
      return true;
    }
    return false;
  }

  /**
   * Find the action bar container for a user message.
   * ChatGPT's action bar (with Copy, Edit buttons) is typically a sibling
   * of the message content container.
   */
  getActionBar(messageElement: HTMLElement): HTMLElement | null {
    // Navigate up to find the parent that contains both message and action bar
    let parent = messageElement.parentElement;

    // Go up a few levels to find the container with the action buttons
    for (let i = 0; i < 8 && parent; i++) {
      // Look for buttons with aria-label (Copy, Edit) within this parent
      const copyButton = parent.querySelector('button[aria-label="Copy"]');
      const editButton = parent.querySelector('button[aria-label="Edit message"]');

      if (copyButton || editButton) {
        // Found the action buttons, return their immediate container
        const button = copyButton || editButton;
        const buttonContainer = button?.parentElement;
        if (buttonContainer instanceof HTMLElement) {
          return buttonContainer;
        }
      }

      // Also check for generic button containers with flex layout
      const flexContainer = parent.querySelector('[class*="flex"][class*="items-center"]');
      if (flexContainer) {
        const buttons = flexContainer.querySelectorAll('button[aria-label]');
        if (buttons.length > 0) {
          return flexContainer as HTMLElement;
        }
      }

      parent = parent.parentElement;
    }

    return null;
  }

  protected getCustomStyles(): string {
    return `
      /* Fallback: absolute positioning on message */
      .promptpocket-button-container {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 50;
      }

      /* Action bar injection: inline with other buttons */
      .promptpocket-button-container.promptpocket-actionbar {
        position: static;
        display: inline-flex;
        margin-left: 0;
      }

      /* Original full-size button (fallback) */
      .promptpocket-save-btn {
        opacity: 0;
        transition: opacity 0.2s ease;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 4px 10px;
        cursor: pointer;
        font-size: 12px;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      .promptpocket-save-btn:hover {
        background: #fff;
        border-color: #3b82f6;
        color: #3b82f6;
      }

      [data-message-author-role="user"]:hover .promptpocket-save-btn {
        opacity: 1;
      }

      .promptpocket-save-btn.saved {
        opacity: 1;
        background: #dbeafe;
        color: #1e40af;
        border-color: #93c5fd;
      }

      /* Compact button for action bar - matches ChatGPT's button style */
      .promptpocket-save-btn-compact {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 6px;
        padding: 6px;
        cursor: pointer;
        color: #676767;
        transition: background-color 0.2s, color 0.2s;
      }

      .promptpocket-save-btn-compact:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #0d0d0d;
      }

      .promptpocket-save-btn-compact.saved {
        color: #2563eb;
      }

      .promptpocket-save-btn-compact.saved:hover {
        color: #1d4ed8;
      }

      /* Dark mode styles */
      @media (prefers-color-scheme: dark) {
        .promptpocket-save-btn {
          background: rgba(55, 65, 81, 0.95);
          border-color: #4b5563;
          color: #d1d5db;
        }
        .promptpocket-save-btn:hover {
          background: #374151;
          border-color: #60a5fa;
          color: #60a5fa;
        }
        .promptpocket-save-btn.saved {
          background: #1e3a5f;
          color: #93c5fd;
          border-color: #3b82f6;
        }

        .promptpocket-save-btn-compact {
          color: #ececec;
        }
        .promptpocket-save-btn-compact:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .promptpocket-save-btn-compact.saved {
          color: #60a5fa;
        }
        .promptpocket-save-btn-compact.saved:hover {
          color: #93c5fd;
        }
      }

      /* ChatGPT dark theme detection (they use class-based dark mode) */
      .dark .promptpocket-save-btn-compact {
        color: #ececec;
      }
      .dark .promptpocket-save-btn-compact:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .dark .promptpocket-save-btn-compact.saved {
        color: #60a5fa;
      }
      .dark .promptpocket-save-btn-compact.saved:hover {
        color: #93c5fd;
      }
    `;
  }
}
