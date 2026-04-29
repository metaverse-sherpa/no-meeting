import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Inbox, Zap, ChartBar as BarChart2, Settings, Coins } from 'lucide-react';
import { BtmLogo } from './BtmLogo';
import { useApp } from '../lib/context';

const ROLE_LABEL: Record<string, string> = {
  requester: 'Requester',
  reviewer: 'Reviewer',
  both: 'Requester & Reviewer',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profile, profiles, reviewRequests, switchUser } = useApp();

  if (!profile) return <Outlet />;

  const pendingForReview = reviewRequests.filter((r) => r.status === 'pending').length;
  const isRequester = profile.role === 'requester' || profile.role === 'both';

  const navItems = [
    { to: '/', label: 'Requests', icon: LayoutDashboard },
    { to: '/inbox', label: 'Inbox', icon: Inbox, badge: pendingForReview },
    { to: '/interrupt', label: 'Meeting Check', icon: Zap },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/profile', label: 'Settings', icon: Settings },
  ];

  const initials = profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        height: 48,
        borderBottom: '1px solid var(--color-neutral-200)',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28,
            background: 'none', border: 'none', padding: 0,
            color: 'var(--color-neutral-500)', cursor: 'pointer',
            borderRadius: 6, transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-neutral-100)';
            e.currentTarget.style.color = 'var(--color-neutral-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-neutral-500)';
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={16} />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BtmLogo size={14} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-neutral-900)' }}>BTM</span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-400)', fontWeight: 400 }}>get productive</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Token balance */}
        {isRequester && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500,
            color: 'var(--color-primary-700)',
            background: 'var(--color-primary-50)',
            padding: '3px 10px', borderRadius: 6,
          }}>
            <Coins size={12} />
            {profile.token_balance}
          </div>
        )}

        {/* User switcher */}
        <select
          value={profile.id}
          onChange={(e) => switchUser(e.target.value)}
          style={{
            fontSize: 11,
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 4,
            padding: '2px 4px',
            color: 'var(--color-neutral-600)',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name} — {ROLE_LABEL[p.role] ?? p.role}
            </option>
          ))}
        </select>

        {/* Logout */}
        <button
          onClick={() => switchUser(null)}
          title="Back to user list"
          style={{
            display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', padding: '3px 6px',
            color: 'var(--color-neutral-400)', cursor: 'pointer',
            borderRadius: 4, transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-neutral-700)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-400)')}
        >
          <LogOut size={13} />
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Sidebar panel */}
        <aside style={{
          position: 'fixed',
          top: 48,
          left: 0,
          bottom: 0,
          width: 224,
          background: 'white',
          borderRight: '1px solid var(--color-neutral-200)',
          zIndex: 45,
          display: 'flex',
          flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: sidebarOpen ? '4px 0 16px rgba(0,0,0,0.06)' : 'none',
        }}>
          {/* User card */}
          <div style={{
            padding: '16px 16px 12px',
            borderBottom: '1px solid var(--color-neutral-100)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--color-primary-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: 'var(--color-primary-700)',
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.full_name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                    background: isActive ? 'var(--color-primary-50)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.1s, color 0.1s',
                  })}
                  onMouseEnter={(e) => {
                    const a = e.currentTarget;
                    if (!a.getAttribute('aria-current')) {
                      a.style.background = 'var(--color-neutral-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const a = e.currentTarget;
                    if (!a.getAttribute('aria-current')) {
                      a.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge ? (
                    <span style={{
                      background: 'var(--color-error-500)',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '0 5px',
                      borderRadius: 8,
                      lineHeight: '16px',
                    }}>
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          {/* Close button at bottom */}
          <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--color-neutral-100)' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 10px',
                background: 'none', border: 'none', borderRadius: 7,
                fontSize: 13, color: 'var(--color-neutral-400)',
                cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-neutral-50)';
                e.currentTarget.style.color = 'var(--color-neutral-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--color-neutral-400)';
              }}
            >
              <X size={15} />
              Close
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{
          flex: 1,
          padding: '24px',
          maxWidth: 680,
          width: '100%',
          margin: '0 auto',
          marginLeft: sidebarOpen ? 224 : 0,
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
