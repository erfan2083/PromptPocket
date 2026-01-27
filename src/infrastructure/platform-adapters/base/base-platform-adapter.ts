import { IPlatformAdapter } from '@application/ports/output/IPlatformAdapter';
import { PlatformType, PlatformSelectors } from '@shared/types';

export abstract class BasePlatformAdapter implements IPlatformAdapter {
  protected observers: MutationObserver[] = [];
  protected messageCallbacks: Set<(element: HTMLElement) => void> = new Set();

  abstract readonly name: string;
  abstract readonly platform: PlatformType;
  abstract matches(): boolean;
  abstract getSelectors(): PlatformSelectors;
  abstract isUserMessage(element: HTMLElement): boolean;

  async init(): Promise<void> {
    await this.waitForDOM();
    this.observeMessages();
    this.injectStyles();
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.messageCallbacks.clear();
  }

  getUserMessages(): HTMLElement[] {
    const selectors = this.getSelectors();
    return Array.from(document.querySelectorAll<HTMLElement>(selectors.userMessage));
  }

  getMessageText(element: HTMLElement): string {
    const selectors = this.getSelectors();
    const textElement = element.querySelector<HTMLElement>(selectors.messageText);
    return textElement?.innerText || element.innerText || '';
  }

  getInputBox(): HTMLElement | null {
    const selectors = this.getSelectors();
    return document.querySelector<HTMLElement>(selectors.inputBox);
  }

  async insertText(text: string): Promise<void> {
    const input = this.getInputBox();
    if (!input) {
      throw new Error('Input box not found');
    }

    if (this.isContentEditable(input)) {
      await this.insertIntoContentEditable(input, text);
    } else if (this.isTextarea(input)) {
      await this.insertIntoTextarea(input as HTMLTextAreaElement, text);
    } else {
      throw new Error('Unsupported input type');
    }
  }

  onNewMessage(callback: (element: HTMLElement) => void): void {
    this.messageCallbacks.add(callback);
  }

  offNewMessage(callback: (element: HTMLElement) => void): void {
    this.messageCallbacks.delete(callback);
  }

  protected observeMessages(): void {
    const selectors = this.getSelectors();
    const container = document.querySelector(selectors.messagesContainer);

    if (!container) {
      console.warn(`Messages container not found for ${this.name}`);
      setTimeout(() => this.observeMessages(), 1000);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (this.isUserMessage(node)) {
              this.messageCallbacks.forEach(cb => cb(node));
            }
          }
        }
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    this.observers.push(observer);
  }

  protected isContentEditable(element: HTMLElement): boolean {
    return element.contentEditable === 'true' ||
      element.getAttribute('contenteditable') === 'true';
  }

  protected isTextarea(element: HTMLElement): boolean {
    return element.tagName === 'TEXTAREA';
  }

  protected async insertIntoContentEditable(element: HTMLElement, text: string): Promise<void> {
    element.innerText = text;

    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);

    element.focus();
  }

  protected async insertIntoTextarea(textarea: HTMLTextAreaElement, text: string): Promise<void> {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(textarea, text);
    } else {
      textarea.value = text;
    }

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    textarea.focus();
  }

  protected injectStyles(): void {
    const styleId = `promptpocket-${this.platform}-styles`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = this.getCustomStyles();
    document.head.appendChild(style);
  }

  protected getCustomStyles(): string {
    return '';
  }

  protected async waitForDOM(): Promise<void> {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      return;
    }

    return new Promise(resolve => {
      window.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    });
  }
}
