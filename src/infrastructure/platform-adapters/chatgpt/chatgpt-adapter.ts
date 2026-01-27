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
      messagesContainer: 'main [class*="react-scroll-to-bottom"]',
      userMessage: '[data-message-author-role="user"]',
      assistantMessage: '[data-message-author-role="assistant"]',
      messageText: '.whitespace-pre-wrap',
      inputBox: '#prompt-textarea'
    };
  }

  isUserMessage(element: HTMLElement): boolean {
    return element.hasAttribute('data-message-author-role') &&
      element.getAttribute('data-message-author-role') === 'user';
  }

  protected getCustomStyles(): string {
    return `
      .promptpocket-save-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 10;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 12px;
        color: #374151;
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
        border-color: #3b82f6;
      }
    `;
  }
}
