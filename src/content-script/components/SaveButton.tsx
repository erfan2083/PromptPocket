import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { PlatformType } from '@shared/types';

interface SaveButtonProps {
  content: string;
  platform: PlatformType;
  url: string;
}

export function SaveButton({ content, platform, url }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isSaved || isLoading) return;

    setIsLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_PROMPT',
        payload: {
          content,
          platform,
          url
        }
      });

      if (response.success) {
        setIsSaved(true);
        // Show success feedback
        setTimeout(() => {
          // Could reset after some time or keep it saved
        }, 2000);
      } else {
        console.error('Failed to save prompt:', response.error);
        alert('Failed to save prompt: ' + response.error);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Error saving prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`promptpocket-save-btn ${isSaved ? 'saved' : ''}`}
      title={isSaved ? 'Saved to PromptPocket' : 'Save to PromptPocket'}
    >
      {isLoading ? (
        <span className="inline-block animate-spin">⏳</span>
      ) : isSaved ? (
        <>
          <BookmarkCheck size={14} className="inline mr-1" />
          Saved
        </>
      ) : (
        <>
          <Bookmark size={14} className="inline mr-1" />
          Save
        </>
      )}
    </button>
  );
}
