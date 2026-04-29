import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Coins, Menu, X } from 'lucide-react';
import { getCurrentUser, subscribe, useStore, getRequestsForReviewer, switchUser } from '../lib/store';

export function Layout() {
  const [, setRerender] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const user = getCurrentUser();
  const state = useStore();
  const pendingForReview = getRequestsForReviewer(user.id).filter((r) => r.status === 'pending').length;
  const isRequester = user.role === 'requester' || user.role === 'both';

  const navItems = [
    { to: '/', label: 'Requests' },
    { to: '/inbox', label: 'Inbox', badge: pendingForReview },
    { to: '/interrupt', label: 'Meeting Check' },
    { to: '/profile', label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header
        style={{
          height: 48,
          borderBottom: '1px solid var(--color-neutral-200)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
          <Coins size={16} style={{ color: 'var(--color-primary-600)' }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-neutral-900)' }}>TokenFlow</span>
        </div>

        {/* Nav pills - desktop */}
        <nav style={{ display: 'flex', gap: 2 }} className="desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                background: isActive ? 'var(--color-primary-50)' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.1s',
              })}
            >
              {item.label}
              {item.badge ? (
                <span
                  style={{
                    background: 'var(--color-error-500)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '0 5px',
                    borderRadius: 8,
                    lineHeight: '16px',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Token count */}
        {isRequester && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--color-primary-700)',
              background: 'var(--color-primary-50)',
              padding: '3px 10px',
              borderRadius: 6,
            }}
          >
            <Coins size={12} />
            {user.token_balance}
          </div>
        )}

        {/* User switcher */}
        <select
          value={user.id}
          onChange={(e) => {
            switchUser(e.target.value);
            setRerender((n) => n + 1);
          }}
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
          {state.profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', padding: 4, color: 'var(--color-neutral-600)', cursor: 'pointer' }}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid var(--color-neutral-200)',
            padding: '8px 20px',
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
          }}
          className="mobile-nav"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                background: isActive ? 'var(--color-primary-50)' : 'transparent',
                textDecoration: 'none',
              })}
            >
              {item.label}
              {item.badge ? ` (${item.badge})` : ''}
            </NavLink>
          ))}
        </div>
      )}

      {/* Content */}
      <main style={{ flex: 1, padding: '24px 24px', maxWidth: 680, width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
