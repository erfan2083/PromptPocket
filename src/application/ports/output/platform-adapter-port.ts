import { PlatformType, PlatformSelectors } from '@shared/types';

export interface IPlatformAdapter {
  readonly name: string;
  readonly platform: PlatformType;
  
  // Detection
  matches(): boolean;
  
  // Lifecycle
  init(): Promise<void>;
  destroy(): void;
  
  // Selectors
  getSelectors(): PlatformSelectors;
  
  // Message extraction
  getUserMessages(): HTMLElement[];
  getMessageText(element: HTMLElement): string;
  
  // Input operations
  getInputBox(): HTMLElement | null;
  insertText(text: string): Promise<void>;
  
  // Event handling
  onNewMessage(callback: (element: HTMLElement) => void): void;
  offNewMessage(callback: (element: HTMLElement) => void): void;
}
