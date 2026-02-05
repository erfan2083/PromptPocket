import { BasePlatformAdapter } from '../base/BasePlatformAdapter';
import { PlatformType, PlatformSelectors } from '@shared/types';

export class GeminiAdapter extends BasePlatformAdapter {
  readonly name = 'Gemini';
  readonly platform: PlatformType = 'gemini';

  matches(): boolean {
    return window.location.hostname.includes('gemini.google.com');
  }

  getSelectors(): PlatformSelectors {
    return {
      messagesContainer: 'main, .conversation-container',
      userMessage: 'user-query',
      assistantMessage: 'model-response',
      messageText: '.query-text, .query-text-line, .user-query-bubble-with-background',
      inputBox: '.ql-editor, [contenteditable="true"], textarea'
    };
  }

  isUserMessage(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() === 'user-query';
  }

  /**
   * Find the action bar container for a user message.
   * Gemini has a copy button inside the user query that we can use as reference.
   */
  getActionBar(messageElement: HTMLElement): HTMLElement | null {
    // Look for the copy button inside the user query
    const copyButton = messageElement.querySelector('button[aria-label="Copy prompt"]');

    if (copyButton) {
      // Return the parent container of the copy button
      const buttonContainer = copyButton.parentElement;
      if (buttonContainer instanceof HTMLElement) {
        return buttonContainer;
      }
    }

    // Fallback: look for query-content div which contains action buttons
    const queryContent = messageElement.querySelector('.query-content');
    if (queryContent instanceof HTMLElement) {
      // Look for the div containing the copy button
      const actionDiv = queryContent.querySelector('div:has(button[aria-label="Copy prompt"])');
      if (actionDiv instanceof HTMLElement) {
        return actionDiv;
      }
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

      user-query:hover .promptpocket-save-btn {
        opacity: 1;
      }

      .promptpocket-save-btn.saved {
        opacity: 1;
        background: #dbeafe;
        color: #1e40af;
        border-color: #93c5fd;
      }

      /* Compact button for action bar - matches Gemini's Material Design style */
      .promptpocket-save-btn-compact {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 50%;
        padding: 8px;
        cursor: pointer;
        color: #5f6368;
        transition: background-color 0.2s, color 0.2s;
        width: 40px;
        height: 40px;
        min-width: 40px;
      }

      .promptpocket-save-btn-compact:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #202124;
      }

      .promptpocket-save-btn-compact.saved {
        color: #1a73e8;
      }

      .promptpocket-save-btn-compact.saved:hover {
        color: #1557b0;
        background: rgba(26, 115, 232, 0.08);
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
          color: #e8eaed;
        }
        .promptpocket-save-btn-compact:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .promptpocket-save-btn-compact.saved {
          color: #8ab4f8;
        }
        .promptpocket-save-btn-compact.saved:hover {
          color: #aecbfa;
          background: rgba(138, 180, 248, 0.08);
        }
      }

      /* Gemini uses class-based dark theme detection */
      [data-theme="dark"] .promptpocket-save-btn-compact,
      .dark-theme .promptpocket-save-btn-compact {
        color: #e8eaed;
      }
      [data-theme="dark"] .promptpocket-save-btn-compact:hover,
      .dark-theme .promptpocket-save-btn-compact:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
      [data-theme="dark"] .promptpocket-save-btn-compact.saved,
      .dark-theme .promptpocket-save-btn-compact.saved {
        color: #8ab4f8;
      }
      [data-theme="dark"] .promptpocket-save-btn-compact.saved:hover,
      .dark-theme .promptpocket-save-btn-compact.saved:hover {
        color: #aecbfa;
        background: rgba(138, 180, 248, 0.08);
      }
    `;
  }
}
