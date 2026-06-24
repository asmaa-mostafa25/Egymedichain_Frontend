import { useEffect, useState } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Package, 
  Truck, 
  FileText,
  Users,
  Settings,
  LogOut,
  Activity,
  CheckSquare,
  ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore, useAuthStore } from '../../store';

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
  { id: 'monitoring', label: 'Go to Monitoring', icon: Activity, path: '/monitoring', category: 'Navigation' },
  { id: 'inventory', label: 'Go to Inventory', icon: Package, path: '/inventory', category: 'Navigation' },
  { id: 'shipments', label: 'Go to Shipments', icon: Truck, path: '/shipments', category: 'Navigation' },
  { id: 'approvals', label: 'Go to Approvals', icon: CheckSquare, path: '/approvals', category: 'Navigation' },
  { id: 'reports', label: 'Go to Reports', icon: FileText, path: '/reports', category: 'Navigation' },
  { id: 'staff', label: 'Go to Staff Management', icon: Users, path: '/staff', category: 'Navigation' },
  { id: 'audit', label: 'Go to Audit Logs', icon: ClipboardList, path: '/audit', category: 'Navigation' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, path: '/settings', category: 'Navigation' },
  { id: 'logout', label: 'Logout', icon: LogOut, action: 'logout', category: 'Account' },
];

const CommandPalette = () => {
  const navigate = useNavigate();
  const { closeCommandPalette } = useUIStore();
  const { logout } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const handleSelect = (command) => {
    if (command.path) {
      navigate(command.path);
    } else if (command.action === 'logout') {
      logout();
    }
    closeCommandPalette();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 'var(--z-modal)',
      }}
      onClick={closeCommandPalette}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fadeIn"
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 'var(--font-size-md)',
              color: 'var(--text-primary)',
            }}
          />
          <kbd
            style={{
              padding: '4px 8px',
              fontSize: 'var(--font-size-xs)',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: 'var(--spacing-sm)' }}>
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {category}
              </div>
              {cmds.map((cmd) => {
                const Icon = cmd.icon;
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md)',
                      backgroundColor: isSelected ? 'var(--accent-secondary)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      setSelectedIndex(globalIndex);
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: 'var(--font-size-base)' }}>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div
              style={{
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
