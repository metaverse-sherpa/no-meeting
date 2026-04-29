import { useState } from 'react';
import { Coins } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';
import type { UserRole } from '../types';

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('requester');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName, role, title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-neutral-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Coins size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-neutral-900)' }}>TokenFlow</span>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 28,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: 'var(--color-neutral-900)' }}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginBottom: 20 }}>
            {mode === 'signin' ? 'Welcome back to TokenFlow' : 'Replace meetings with async decisions'}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Alex Chen"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Job title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Product Manager"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Role</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['requester', 'reviewer', 'both'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: '1px solid',
                          borderColor: role === r ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                          borderRadius: 6,
                          background: role === r ? 'var(--color-primary-50)' : 'white',
                          color: role === r ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                          fontSize: 12,
                          fontWeight: role === r ? 500 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {r === 'both' ? 'Both' : r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 4 }}>
                    {role === 'requester' && 'You submit requests and spend tokens'}
                    {role === 'reviewer' && 'You review requests from others'}
                    {role === 'both' && 'You can both submit and review requests'}
                  </p>
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                padding: '8px 12px',
                background: 'var(--color-error-50)',
                color: 'var(--color-error-600)',
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '9px 16px',
                background: loading ? 'var(--color-neutral-300)' : 'var(--color-primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 500,
                cursor: loading ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--color-neutral-500)' }}>
            {mode === 'signin' ? (
              <>
                No account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontWeight: 500, fontSize: 12 }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', fontWeight: 500, fontSize: 12 }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-neutral-600)',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--color-neutral-200)',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--color-neutral-800)',
  background: 'white',
  outline: 'none',
};
