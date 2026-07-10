import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { getNavigationForRole } from '../../routes/navigation';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

 

  const navigation = getNavigationForRole(role);

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const isPathActive = (path) =>
    path &&
    (location.pathname === path ||
      (path !== '/dashboard' && location.pathname.startsWith(path)));

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
              fontSize: '10.5px',
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0 10px',
              marginBottom: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            Main Menu
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children?.length;
            const isActive = isPathActive(item.path);
           
            const childActive =
              hasChildren && item.children.some((child) => isPathActive(child.path));

            if (hasChildren) {
              return (
                <div key={item.id}>
                 <button
    onClick={() => navigate(item.children[0].path)}

                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: childActive ? '#fff' : 'transparent',
color: childActive ? '#004399' : 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      fontWeight: childActive ? 600 : 400,
                      fontSize: '13.5px',
                    }}
                   onMouseEnter={(e) => {
  if (!childActive) {
    e.currentTarget.style.backgroundColor = '#fff';
    e.currentTarget.style.color = '#004399';
  }
}}
                    onMouseLeave={(e) => {
                      if (!childActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                      }
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />

                    {!sidebarCollapsed && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left', lineHeight: 1.25, whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis', }}>
                          {item.label}
                        </span>
                       
                        
                      </>
                    )}
                  </button>

                  {/* ── Children: plain text list, no icons, indented under the parent label ── */}
                  {!sidebarCollapsed && (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginTop: '6px',
            marginLeft: '18px',
            paddingLeft: '14px',
            borderLeft: '2px solid rgba(255,255,255,.25)',
        }}
    >
        {item.children.map((child) => {
            const childIsActive = isPathActive(child.path);

            return (
                <NavLink
                    key={child.id}
                    to={child.path}
                    style={{
                        display: 'block',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        color: childIsActive
                            ? '#fff'
                            : 'rgba(255,255,255,.65)',
                        textDecoration: 'none',
                        background: childIsActive
                            ? 'rgba(255,255,255,.12)'
                            : 'transparent',
                        fontSize: '12.5px',
                        fontWeight: childIsActive ? 600 : 400,
                    }}
                >
                    {child.label}
                </NavLink>
            );
        })}
    </div>
)}
                </div>
              );
            }

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
                  color: isActive ? '#004399' : 'rgba(255,255,255,0.65)',
                  backgroundColor: isActive ? '#fff' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '12.5px',
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
                    <span style={{ flex: 1, lineHeight: 1.25, whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis', }}>
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
            fontSize: '13.5px',
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
            fontSize: '13.5px',
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
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '8px',
              width: '100%',
              paddingTop: '10px',
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{
                width: 44,
                height: 44,
                objectFit: 'contain',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                وزارة الصحة والسكان
              </div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.75)',
                  whiteSpace: 'nowrap',
                }}
              >
                Ministry of Health & Population
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;