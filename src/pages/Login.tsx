import { BtmLogo } from '../components/BtmLogo';
import { useApp } from '../lib/context';

const ROLE_LABEL: Record<string, string> = {
  requester: 'Requester',
  reviewer: 'Reviewer',
  both: 'Requester & Reviewer',
};

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  requester: { bg: 'var(--color-primary-50)', color: 'var(--color-primary-700)' },
  reviewer:  { bg: 'var(--color-success-50)', color: 'var(--color-success-700)' },
  both:      { bg: 'var(--color-accent-50)',  color: 'var(--color-accent-600)' },
};

export function MockLogin() {
  const { profiles, switchUser } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-neutral-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BtmLogo size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-neutral-900)' }}>BTM</span>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 28 }}>
          get productive
        </p>

        <div style={{
          background: 'white',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 16 }}>
            Continue as
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profiles.map((p) => {
              const roleStyle = ROLE_COLOR[p.role] ?? ROLE_COLOR.requester;
              return (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'white',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                    e.currentTarget.style.background = 'var(--color-primary-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--color-neutral-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-600)',
                    flexShrink: 0,
                  }}>
                    {p.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-900)' }}>{p.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{p.title}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: '2px 8px',
                    borderRadius: 20, flexShrink: 0,
                    background: roleStyle.bg, color: roleStyle.color,
                  }}>
                    {ROLE_LABEL[p.role]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
