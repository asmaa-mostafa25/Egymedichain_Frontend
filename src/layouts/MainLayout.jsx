import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Footer from '../components/layout/Footer';
import CommandPalette from '../components/common/CommandPalette';
import ToastContainer from '../components/common/ToastContainer';
import GlobalAlertOverlay from '../components/common/GlobalAlertOverlay';
import { useUIStore } from '../store';
import { useEffect } from 'react';

const MainLayout = () => {
  const { sidebarCollapsed, commandPaletteOpen, closeCommandPalette } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, closeCommandPalette]);

  const sidebarWidth = sidebarCollapsed ? '72px' : '220px';

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <Sidebar />

      {/* Right side wrapper */}
      <div
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          transition: 'margin-left var(--transition-normal)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 200,
          }}
        >
          <Topbar />
        </div>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: 'var(--spacing-xl)',
            background: 'transparent',
          }}
        >
          <div className="page-shell">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      {commandPaletteOpen && <CommandPalette />}
      <ToastContainer />
      <GlobalAlertOverlay />
    </div>
  );
};

export default MainLayout;