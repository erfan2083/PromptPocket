import { useEffect, useState } from 'react';
import { usePromptStore } from '../stores/promptStore';
import { Prompt } from '@domain/entities/Prompt';
import {
  Search, Plus, BookOpen, X, Trash2, Copy, Check, ArrowLeft, Pencil, Calendar, BarChart3,
} from 'lucide-react';

export default function Library() {
  const { prompts, isLoading, error, loadPrompts, savePrompt, updatePrompt, deletePrompt } =
    usePromptStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail / Edit view state
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Listen for prompts updated from content script save button
  useEffect(() => {
    const listener = (message: { type: string }) => {
      if (message.type === 'PROMPTS_UPDATED') {
        loadPrompts();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [loadPrompts]);

  // Keep selectedPrompt in sync with store after reload
  useEffect(() => {
    if (selectedPrompt) {
      const updated = prompts.find((p) => p.id.value === selectedPrompt.id.value);
      if (updated) {
        setSelectedPrompt(updated);
      } else {
        // Prompt was deleted
        setSelectedPrompt(null);
        setIsEditing(false);
      }
    }
  }, [prompts, selectedPrompt?.id.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!newContent.trim()) {
      setSaveError('Content is required');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await savePrompt({
        content: newContent.trim(),
        title: newTitle.trim() || undefined,
        tags: newTags.trim()
          ? newTags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      });
      setShowNewForm(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePrompt(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openPromptDetail = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsEditing(false);
    setEditError(null);
  };

  const startEditing = () => {
    if (!selectedPrompt) return;
    setEditTitle(selectedPrompt.title);
    setEditContent(selectedPrompt.content);
    setEditTags(selectedPrompt.tags.map((t) => t.value).join(', '));
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!selectedPrompt) return;
    if (!editContent.trim()) {
      setEditError('Content is required');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await updatePrompt({
        id: selectedPrompt.id.value,
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
        tags: editTags.trim()
          ? editTags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      });
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setEditSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // ── Prompt Detail / Edit View ──────────────────────────────────
  if (selectedPrompt) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Detail Header */}
        <header className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedPrompt(null);
                setIsEditing(false);
              }}
              className="p-1.5 hover:bg-secondary rounded"
              title="Back to list"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="font-semibold flex-1 min-w-0 truncate">
              {isEditing ? 'Edit Prompt' : 'Prompt Details'}
            </h2>
            <div className="flex gap-1">
              {!isEditing && (
                <>
                  <button
                    onClick={() => handleCopy(selectedPrompt.content, selectedPrompt.id.value)}
                    className="p-1.5 hover:bg-secondary rounded"
                    title="Copy to clipboard"
                  >
                    {copiedId === selectedPrompt.id.value ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    onClick={startEditing}
                    className="p-1.5 hover:bg-secondary rounded"
                    title="Edit prompt"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedPrompt.id.value);
                      setSelectedPrompt(null);
                    }}
                    className="p-1.5 hover:bg-secondary rounded text-destructive"
                    title="Delete prompt"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Detail / Edit Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Prompt content..."
                  rows={10}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="tag1, tag2, ..."
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 text-sm"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold break-words">{selectedPrompt.title}</h3>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Content
                </label>
                <div className="p-3 bg-secondary/50 rounded-lg text-sm whitespace-pre-wrap break-words">
                  {selectedPrompt.content}
                </div>
              </div>

              {/* Tags */}
              {selectedPrompt.tags.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag) => (
                      <span
                        key={tag.value}
                        className="px-2 py-1 bg-secondary rounded text-xs"
                      >
                        {tag.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>
                    Created:{' '}
                    {new Date(selectedPrompt.metadata.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedPrompt.metadata.updatedAt !== selectedPrompt.metadata.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>
                      Updated:{' '}
                      {new Date(selectedPrompt.metadata.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 size={12} />
                  <span>Used {selectedPrompt.stats.usedCount} times</span>
                </div>
                {selectedPrompt.metadata.source.platform !== 'unknown' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Source: {selectedPrompt.metadata.source.platform}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── Main List View ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">PromptPocket</h1>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
          >
            <Plus size={18} />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </header>

      {/* New Prompt Form */}
      {showNewForm && (
        <div className="border-b border-border px-6 py-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">New Prompt</h3>
            <button
              onClick={() => {
                setShowNewForm(false);
                setSaveError(null);
              }}
              className="p-1 hover:bg-secondary rounded"
            >
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 mb-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <textarea
            placeholder="Prompt content..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 mb-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
          <input
            type="text"
            placeholder="Tags (comma separated, optional)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="w-full px-3 py-2 mb-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          {saveError && <p className="text-sm text-destructive mb-2">{saveError}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Prompt'}
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading prompts...</p>
            </div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No prompts yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No prompts match your search'
                : 'Start saving prompts from your AI chats'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id.value}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition bg-card group min-w-0 cursor-pointer"
                onClick={() => openPromptDetail(prompt)}
              >
                <div className="flex items-start justify-between mb-2 min-w-0">
                  <h3 className="font-semibold flex-1 min-w-0 break-words">{prompt.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(prompt.content, prompt.id.value);
                      }}
                      className="p-1.5 hover:bg-secondary rounded"
                      title="Copy to clipboard"
                    >
                      {copiedId === prompt.id.value ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(prompt.id.value);
                      }}
                      className="p-1.5 hover:bg-secondary rounded text-destructive"
                      title="Delete prompt"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 break-words overflow-hidden">
                  {prompt.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground min-w-0">
                  <div className="flex gap-2 flex-wrap min-w-0 flex-1 mr-2">
                    {prompt.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.value}
                        className="px-2 py-1 bg-secondary rounded truncate max-w-[120px]"
                      >
                        {tag.value}
                      </span>
                    ))}
                  </div>
                  <span className="flex-shrink-0">
                    {new Date(prompt.metadata.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Stats Footer */}
      <footer className="border-t border-border px-6 py-3 text-sm text-muted-foreground">
        {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'} saved
      </footer>
    </div>
  );
}
