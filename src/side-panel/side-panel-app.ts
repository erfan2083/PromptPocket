import { useEffect, useState } from 'react';
import { getContainer, setupDI } from '@infrastructure/di';
import Library from '@presentation/pages/Library';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const container = getContainer();
        await setupDI(container);
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Initialization Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PromptPocket...</p>
        </div>
      </div>
    );
  }

  return <Library />;
}

export default App;
