import { useState } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { Cloud, CloudOff, RefreshCw, LogOut, Smartphone } from 'lucide-react';

export default function SyncPanel() {
  const { isSignedIn, isSyncing, lastSyncAt, error, email, signIn, signOut, syncNow } =
    useSyncStore();
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!formEmail.trim() || !formPassword.trim()) {
      setFormError('Email and password are required');
      return;
    }
    setFormError(null);
    await signIn(formEmail.trim(), formPassword.trim());
    if (useSyncStore.getState().isSignedIn) {
      setShowForm(false);
      setFormEmail('');
      setFormPassword('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowForm(false);
  };

  if (isSignedIn) {
    return (
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Cloud size={14} />
            <span>Synced</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className="p-1.5 hover:bg-secondary rounded"
              title="Sync now"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground"
              title="Sign out of sync"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
        {email && (
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        )}
        {lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(lastSyncAt).toLocaleTimeString()}
          </p>
        )}
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Smartphone size={12} />
          <span>Use this account in the mobile app to sync</span>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Cloud size={14} />
            <span>Cloud Sync</span>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Sign in to sync prompts with the mobile app. A new account will be created if one
          doesn't exist.
        </p>
        <input
          type="email"
          placeholder="Email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          className="w-full px-2 py-1.5 mb-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          type="password"
          placeholder="Password"
          value={formPassword}
          onChange={(e) => setFormPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          className="w-full px-2 py-1.5 mb-2 border border-input rounded bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {(formError || error) && (
          <p className="text-xs text-destructive mb-2">{formError || error}</p>
        )}
        <button
          onClick={handleSignIn}
          disabled={isSyncing}
          className="w-full px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isSyncing ? 'Connecting...' : 'Sign In & Sync'}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border px-4 py-3">
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition w-full"
      >
        <CloudOff size={14} />
        <span>Enable Cloud Sync</span>
        <Smartphone size={12} className="ml-auto" />
      </button>
    </div>
  );
}
