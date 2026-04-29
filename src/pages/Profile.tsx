import { useState, useEffect } from 'react';
import { Plus, X, Coins, Shield } from 'lucide-react';
import {
  getCurrentUser,
  subscribe,
  getExpertiseForReviewer,
  addExpertiseArea,
  removeExpertiseArea,
  updateProfile,
} from '../lib/store';
import type { UserRole } from '../types';

export function Profile() {
  const [, setRerender] = useState(0);
  const [showAddExpertise, setShowAddExpertise] = useState(false);
  const [newExpertiseName, setNewExpertiseName] = useState('');
  const [newExpertiseDesc, setNewExpertiseDesc] = useState('');
  const [newExpertiseCapacity, setNewExpertiseCapacity] = useState(3);

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const user = getCurrentUser();
  const isReviewer = user.role === 'reviewer' || user.role === 'both';
  const expertiseAreas = getExpertiseForReviewer(user.id);

  const handleAddExpertise = () => {
    if (!newExpertiseName.trim()) return;
    addExpertiseArea({
      reviewer_id: user.id,
      name: newExpertiseName.trim(),
      description: newExpertiseDesc.trim(),
      weekly_capacity: newExpertiseCapacity,
    });
    setNewExpertiseName('');
    setNewExpertiseDesc('');
    setNewExpertiseCapacity(3);
    setShowAddExpertise(false);
  };

  const handleRoleChange = (newRole: UserRole) => {
    updateProfile(user.id, { role: newRole });
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Profile & Settings</h1>

      {/* User info */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--color-primary-700)',
            }}
          >
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 2 }}>{user.full_name}</h2>
            <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>{user.title}</p>
          </div>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 8 }}>
            Your role
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(
              [
                ['requester', 'Requester', 'I need decisions from others'],
                ['reviewer', 'Reviewer', 'I make decisions for others'],
                ['both', 'Both', 'I request and review decisions'],
              ] as [UserRole, string, string][]
            ).map(([role, label, desc]) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  border: '1px solid',
                  borderColor: user.role === role ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                  borderRadius: 'var(--radius-md)',
                  background: user.role === role ? 'var(--color-primary-50)' : 'white',
                  color: user.role === role ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Token info for requesters */}
        {(user.role === 'requester' || user.role === 'both') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              color: 'var(--color-primary-700)',
            }}
          >
            <Coins size={16} />
            <span>
              <strong>{user.token_balance}</strong> tokens remaining this week
              ({user.tokens_used_this_week} used)
            </span>
          </div>
        )}
      </div>

      {/* Expertise areas for reviewers */}
      {isReviewer && (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} style={{ color: 'var(--color-primary-600)' }} />
              Expertise Areas
            </h2>
            <button
              onClick={() => setShowAddExpertise(!showAddExpertise)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: 'var(--color-primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontWeight: 500,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary-600)')}
            >
              <Plus size={14} />
              Add Area
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 16 }}>
            Define what you're willing to review and how many tokens you'll accept per week.
            Requesters can only send you tokens in these areas.
          </p>

          {/* Add expertise form */}
          {showAddExpertise && (
            <div
              style={{
                background: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 4 }}>
                  Area name
                </label>
                <input
                  type="text"
                  value={newExpertiseName}
                  onChange={(e) => setNewExpertiseName(e.target.value)}
                  placeholder="e.g. Backend Architecture"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 4 }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newExpertiseDesc}
                  onChange={(e) => setNewExpertiseDesc(e.target.value)}
                  placeholder="What types of decisions can you help with?"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 4 }}>
                  Weekly token capacity
                </label>
                <input
                  type="number"
                  value={newExpertiseCapacity}
                  onChange={(e) => setNewExpertiseCapacity(parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                  style={{
                    width: 80,
                    padding: '8px 12px',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddExpertise(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    color: 'var(--color-neutral-600)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpertise}
                  disabled={!newExpertiseName.trim()}
                  style={{
                    padding: '8px 16px',
                    background: newExpertiseName.trim() ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
                    color: newExpertiseName.trim() ? 'white' : 'var(--color-neutral-400)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Add Area
                </button>
              </div>
            </div>
          )}

          {/* Existing expertise */}
          {expertiseAreas.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 32,
                color: 'var(--color-neutral-400)',
                border: '1px dashed var(--color-neutral-300)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Shield size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p style={{ fontSize: 14 }}>No expertise areas defined yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Add areas to start receiving token requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {expertiseAreas.map((area) => (
                <div
                  key={area.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--color-neutral-50)',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-neutral-800)', marginBottom: 2 }}>
                      {area.name}
                    </div>
                    {area.description && (
                      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{area.description}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: 'var(--color-neutral-500)',
                      }}
                    >
                      <Coins size={12} />
                      {area.tokens_received_this_week}/{area.weekly_capacity} this week
                    </div>
                    <button
                      onClick={() => removeExpertiseArea(area.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 4,
                        color: 'var(--color-neutral-400)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error-500)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-400)')}
                    >
                      <X size={14} />
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
