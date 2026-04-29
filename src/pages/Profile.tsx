import { useState } from 'react';
import { Plus, X, Coins, Shield } from 'lucide-react';
import { useApp } from '../lib/context';
import type { UserRole } from '../types';

export function Profile() {
  const { profile, getExpertiseForReviewer, addExpertiseArea, removeExpertiseArea, updateRole } = useApp();
  const [showAddExpertise, setShowAddExpertise] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCapacity, setNewCapacity] = useState(3);
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const isReviewer = profile.role === 'reviewer' || profile.role === 'both';
  const expertiseAreas = getExpertiseForReviewer(profile.id);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await addExpertiseArea({ name: newName.trim(), description: newDesc.trim(), weekly_capacity: newCapacity });
      setNewName(''); setNewDesc(''); setNewCapacity(3); setShowAddExpertise(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (role: UserRole) => {
    await updateRole(role);
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Settings</h1>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-800)', marginBottom: 2 }}>{profile.full_name}</p>
        {profile.title && <p style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{profile.title}</p>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Role</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['requester', 'reviewer', 'both'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              style={{
                padding: '5px 12px', border: '1px solid',
                borderColor: profile.role === role ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                borderRadius: 4,
                background: profile.role === role ? 'var(--color-primary-50)' : 'white',
                color: profile.role === role ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                fontSize: 12, fontWeight: profile.role === role ? 500 : 400, cursor: 'pointer',
              }}
            >
              {role === 'both' ? 'Both' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {(profile.role === 'requester' || profile.role === 'both') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '6px 12px', borderRadius: 6, marginBottom: 20 }}>
          <Coins size={13} />
          {profile.token_balance} tokens remaining ({profile.tokens_used_this_week} used this week)
        </div>
      )}

      {isReviewer && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>
              <Shield size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Expertise areas
            </label>
            <button
              onClick={() => setShowAddExpertise(!showAddExpertise)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--color-primary-600)', color: 'white', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
            >
              <Plus size={11} /> Add
            </button>
          </div>

          {showAddExpertise && (
            <div style={{ background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: 6, padding: 12, marginBottom: 10 }}>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Area name" style={{ ...inputStyle, marginBottom: 8 }} />
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description" style={{ ...inputStyle, marginBottom: 8 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Weekly capacity:</span>
                <input type="number" value={newCapacity} onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)} min={1} max={20} style={{ ...inputStyle, width: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddExpertise(false)} style={{ padding: '4px 10px', background: 'white', border: '1px solid var(--color-neutral-200)', borderRadius: 4, fontSize: 11, color: 'var(--color-neutral-500)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAdd} disabled={!newName.trim() || saving} style={{ padding: '4px 10px', background: newName.trim() && !saving ? 'var(--color-primary-600)' : 'var(--color-neutral-200)', color: newName.trim() && !saving ? 'white' : 'var(--color-neutral-400)', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {expertiseAreas.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-neutral-400)', border: '1px dashed var(--color-neutral-300)', borderRadius: 6, fontSize: 12 }}>
              No expertise areas. Add one to start receiving tokens.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {expertiseAreas.map((area) => (
                <div
                  key={area.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: 6,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-800)' }}>{area.name}</span>
                    {area.description && <span style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginLeft: 8 }}>{area.description}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Coins size={10} /> {area.tokens_received_this_week}/{area.weekly_capacity}
                    </span>
                    <button
                      onClick={() => removeExpertiseArea(area.id)}
                      style={{ background: 'none', border: 'none', padding: 2, color: 'var(--color-neutral-300)', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error-500)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-300)')}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-600)', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 10px', border: '1px solid var(--color-neutral-200)', borderRadius: 4, fontSize: 12, color: 'var(--color-neutral-800)', background: 'white', outline: 'none' };
