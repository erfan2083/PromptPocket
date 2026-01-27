import { useEffect, useState } from 'react';
import { usePromptStore } from '../stores/promptStore';
import { Search, Plus, BookOpen, X, Trash2, Copy, Check } from 'lucide-react';

export default function Library() {
  const { prompts, isLoading, error, loadPrompts, savePrompt, deletePrompt } = usePromptStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const filteredPrompts = prompts.filter(p =>
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
        tags: newTags.trim() ? newTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
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
              onClick={() => { setShowNewForm(false); setSaveError(null); }}
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
          {saveError && (
            <p className="text-sm text-destructive mb-2">{saveError}</p>
          )}
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
      <main className="flex-1 overflow-y-auto p-6">
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
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition bg-card group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold flex-1">{prompt.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(prompt.content, prompt.id.value)}
                      className="p-1.5 hover:bg-secondary rounded"
                      title="Copy to clipboard"
                    >
                      {copiedId === prompt.id.value ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id.value)}
                      className="p-1.5 hover:bg-secondary rounded text-destructive"
                      title="Delete prompt"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {prompt.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-2">
                    {prompt.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.value}
                        className="px-2 py-1 bg-secondary rounded"
                      >
                        {tag.value}
                      </span>
                    ))}
                  </div>
                  <span>
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
