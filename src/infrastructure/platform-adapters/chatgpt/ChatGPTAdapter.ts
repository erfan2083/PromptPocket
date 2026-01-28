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

  protected getCustomStyles(): string {
    return `
      .promptpocket-button-container {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 50;
      }

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

      [data-message-author-role="user"]:hover .promptpocket-save-btn,
      [data-message-author-role="user"]:hover .promptpocket-button-container .promptpocket-save-btn {
        opacity: 1;
      }

      .promptpocket-save-btn.saved {
        opacity: 1;
        background: #dbeafe;
        color: #1e40af;
        border-color: #93c5fd;
      }

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
      }
    `;
  }
}
