import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { PlatformType } from '@shared/types';

interface SaveButtonProps {
  content: string;
  platform: PlatformType;
  url: string;
  compact?: boolean;
}

export function SaveButton({ content, platform, url, compact = false }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);
  const [contextInvalid, setContextInvalid] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isSaved && savedPromptId) {
        // Unsave: delete the prompt
        const response = await chrome.runtime.sendMessage({
          type: 'DELETE_PROMPT',
          payload: { id: savedPromptId }
        });

        if (response.success) {
          setIsSaved(false);
          setSavedPromptId(null);
        } else {
          console.error('Failed to unsave prompt:', response.error);
        }
      } else {
        // Save the prompt
        const response = await chrome.runtime.sendMessage({
          type: 'SAVE_PROMPT',
          payload: { content, platform, url }
        });

        if (response.success) {
          setIsSaved(true);
          setSavedPromptId(response.data);
        } else {
          console.error('Failed to save prompt:', response.error);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Extension context invalidated')) {
        setContextInvalid(true);
      } else {
        console.error('Error toggling prompt save:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = compact
    ? `promptpocket-save-btn-compact ${isSaved ? 'saved' : ''}`
    : `promptpocket-save-btn ${isSaved ? 'saved' : ''}`;

  if (contextInvalid) {
    return (
      <button
        disabled
        className={buttonClass}
        title="Extension updated — please refresh the page"
        aria-label="Extension updated — please refresh the page"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        {compact ? (
          <Bookmark size={18} />
        ) : (
          <>
            <Bookmark size={14} className="inline mr-1" />
            Refresh page
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={buttonClass}
      title={isSaved ? 'Saved to PromptPocket' : 'Save to PromptPocket'}
      aria-label={isSaved ? 'Saved to PromptPocket' : 'Save to PromptPocket'}
    >
      {isLoading ? (
        <span className="inline-block animate-spin">⏳</span>
      ) : isSaved ? (
        compact ? (
          <BookmarkCheck size={18} />
        ) : (
          <>
            <BookmarkCheck size={14} className="inline mr-1" />
            Saved
          </>
        )
      ) : compact ? (
        <Bookmark size={18} />
      ) : (
        <>
          <Bookmark size={14} className="inline mr-1" />
          Save
        </>
      )}
    </button>
  );
}
