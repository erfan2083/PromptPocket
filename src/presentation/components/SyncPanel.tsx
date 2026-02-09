import { useState, useEffect } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { Cloud, CloudOff, RefreshCw, LogOut, Smartphone } from 'lucide-react';

export default function SyncPanel() {
  const {
    isSignedIn,
    isSyncing,
    lastSyncAt,
    error,
    email,
    signIn,
    signInWithGoogle,
    signOut,
    syncNow,
    checkStatus,
  } = useSyncStore();
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Check sync status on mount to restore persisted state
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

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

  const handleGoogleSignIn = async () => {
    setFormError(null);
    await signInWithGoogle();
    if (useSyncStore.getState().isSignedIn) {
      setShowForm(false);
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
        {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
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
        <p className="text-xs text-muted-foreground mb-3">
          Sign in to sync prompts with the mobile app.
        </p>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 mb-3 border border-input rounded bg-background text-sm hover:bg-secondary transition disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isSyncing ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email/Password Sign-In */}
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
          {isSyncing ? 'Connecting...' : 'Sign In with Email'}
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
