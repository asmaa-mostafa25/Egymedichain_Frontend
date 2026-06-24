import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { getNavigationForRole } from '../../routes/navigation';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const navigation = getNavigationForRole(role);

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <aside
      style={{
        width: sidebarCollapsed ? '72px' : '220px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#004399',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        zIndex: 'var(--z-sticky)',
        overflow: 'hidden',
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: '16px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minHeight: '72px',
        }}
      >
        <img
  src="/images/Frame.png"
  alt="EMC"
  style={{
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    objectFit: 'cover',
    flexShrink: 0,
  }}
/>

        {!sidebarCollapsed && (
          <div className="animate-fadeIn">
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
              EGY MED CHAIN
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
              Pharmaceutical Tracking
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          padding: '4px 10px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className="no-scrollbar"
      >
        {!sidebarCollapsed && (
          <div
            style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0 8px',
              marginBottom: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            Main Menu
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.id}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />

                {!sidebarCollapsed && (
                  <>
                    <span style={{ whiteSpace: 'nowrap', flex: 1 }}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        style={{
                          padding: '2px 7px',
                          fontSize: '10px',
                          fontWeight: 600,
                          backgroundColor:
                            item.badge === 'live'
                              ? 'rgba(34,197,94,0.2)'
                              : 'rgba(255,255,255,0.1)',
                          color: item.badge === 'live' ? '#4ADE80' : '#fff',
                          borderRadius: '20px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Bottom ── */}
      <div
        style={{
          padding: '10px 10px 12px',
          flexShrink: 0,
        }}
      >
        <hr
  style={{
    border: 'none',
    height: '1px',
    background: 'rgba(255,255,255,0.15)',
    margin: '8px 0 12px',
  }}
/>
        {/* Settings */}
        <button
          onClick={handleSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '10px',
            width: '100%',
            padding: '9px 10px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: location.pathname === '/settings' ? 'rgba(255,255,255,0.18)' : 'transparent',
            color: location.pathname === '/settings' ? '#fff' : 'rgba(255,255,255,0.65)',
            fontSize: '13px',
            marginBottom: '2px',
            transition: 'all var(--transition-fast)',
            fontWeight: location.pathname === '/settings' ? 600 : 400,
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== '/settings') {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/settings') {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
            }
          }}
        >
          <Settings size={18} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '10px',
            width: '100%',
            padding: '9px 10px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.65)',
            fontSize: '13px',
            marginBottom: '12px',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)';
            e.currentTarget.style.color = '#FCA5A5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && <span>Log Out</span>}
        </button>
<hr
  style={{
    border: 'none',
    height: '1px',
    background: 'rgba(255,255,255,0.15)',
    margin: '12px 0 0',
  }}
/>
        {/* Ministry badge */}
       {!sidebarCollapsed && (
  <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
  }}
>
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'right',
    }}
  >
    <div
      style={{
       fontSize: '16px',
fontWeight: 800,
        color: '#fff',
        
      }}
    >
      وزارة الصحة والسكان
    </div>

    <div
      style={{
       fontSize: '9px',
fontWeight: 600,
        color: '#fff',
        
        whiteSpace: 'nowrap', // يمنع النزول لسطر جديد
      }}
    >
      Ministry of Health & Population
    </div>
  </div>

  <img
    src="/images/logo.png"
    alt="Logo"
    style={{
      width: 65,
      height: 65,
      objectFit: 'contain',
    }}
  />
</div>
)}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#004399',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'all var(--transition-fast)',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0055CC';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#004399';
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;