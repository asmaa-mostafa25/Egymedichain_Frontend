import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useAuthStore, useUIStore, useNotificationStore } from './store';
import LoadingScreen from './components/common/LoadingScreen';
import ToastContainer from './components/common/ToastContainer';
import GlobalAlertOverlay from './components/common/GlobalAlertOverlay';
import CommandPalette from './components/common/CommandPalette';

function App() {
  const { initializeAuth, isLoading: authLoading } = useAuthStore();
  const { theme, isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { toasts } = useNotificationStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setAppReady(true);
    };
    init();
  }, [initializeAuth]);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Command palette keyboard shortcut
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!appReady || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} />
      <GlobalAlertOverlay />
      {isCommandPaletteOpen && (
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)} 
        />
      )}
    </>
  );
}

export default App;
