import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Send,
  Inbox,
  User,
  BarChart3,
  Coins,
  Menu,
  X,
} from 'lucide-react';
import { getCurrentUser, subscribe, useStore, getRequestsForReviewer, switchUser } from '../lib/store';

export function Layout() {
  const [, setRerender] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const user = getCurrentUser();
  const state = useStore();
  const pendingForReview = getRequestsForReviewer(user.id).filter((r) => r.status === 'pending').length;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/request/new', icon: Send, label: 'New Request' },
    { to: '/inbox', icon: Inbox, label: 'Inbox', badge: pendingForReview },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const isRequester = user.role === 'requester' || user.role === 'both';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile header */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'white',
          borderBottom: '1px solid var(--color-neutral-200)',
          zIndex: 100,
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
        }}
        className="mobile-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Coins size={20} style={{ color: 'var(--color-primary-600)' }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>TokenFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            color: 'var(--color-neutral-600)',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: 'white',
          borderRight: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 90,
          transition: 'transform 0.2s ease',
        }}
        className="sidebar"
      >
        <div
          style={{
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid var(--color-neutral-100)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coins size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-neutral-900)' }}>
              TokenFlow
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 1 }}>
              Async decisions, fewer meetings
            </div>
          </div>
        </div>

        {/* User info */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-neutral-100)',
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-neutral-900)' }}>
            {user.full_name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>
            {user.title}
          </div>
          {isRequester && (
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                background: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-primary-700)',
              }}
            >
              <Coins size={14} />
              {user.token_balance} tokens remaining
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive
                  ? 'var(--color-primary-700)'
                  : 'var(--color-neutral-600)',
                background: isActive ? 'var(--color-primary-50)' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              <item.icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? (
                <span
                  style={{
                    background: 'var(--color-error-500)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 10,
                    lineHeight: '18px',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* User switcher for demo */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-neutral-100)',
            fontSize: 11,
            color: 'var(--color-neutral-400)',
          }}
        >
          <div style={{ marginBottom: 6, fontWeight: 500 }}>Demo: Switch user</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {state.profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  switchUser(p.id);
                  setRerender((n) => n + 1);
                }}
                style={{
                  background: p.id === user.id ? 'var(--color-primary-50)' : 'transparent',
                  border: '1px solid',
                  borderColor: p.id === user.id ? 'var(--color-primary-200)' : 'var(--color-neutral-200)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: 11,
                  textAlign: 'left',
                  color: p.id === user.id ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                  fontWeight: p.id === user.id ? 500 : 400,
                }}
              >
                {p.full_name} - {p.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 240,
          padding: '32px 40px',
          maxWidth: 960,
          width: '100%',
        }}
        className="main-content"
      >
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .sidebar {
            transform: translateX(${mobileOpen ? '0' : '-100%'});
          }
          .main-content {
            margin-left: 0 !important;
            padding: 72px 16px 24px !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
