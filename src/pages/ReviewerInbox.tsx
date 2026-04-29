import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useApp } from '../lib/context';
import { StatusBadge, DecisionTypeBadge } from '../components/StatusBadge';
import type { RequestStatus } from '../types';

export function ReviewerInbox() {
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const navigate = useNavigate();
  const { reviewRequests, getExpertiseArea } = useApp();

  const filteredRequests = filter === 'all' ? reviewRequests : reviewRequests.filter((r) => r.status === filter);
  const pending = reviewRequests.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          Inbox
          {pending > 0 && (
            <span style={{ background: 'var(--color-error-500)', color: 'white', fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 8 }}>
              {pending}
            </span>
          )}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'in_review', 'needs_info', 'approved', 'rejected'] as const).map((f) => {
          const count = f === 'all' ? reviewRequests.length : reviewRequests.filter((r) => r.status === f).length;
          if (count === 0 && f !== 'all') return null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '3px 10px', border: '1px solid',
                borderColor: filter === f ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                borderRadius: 12,
                background: filter === f ? 'var(--color-primary-50)' : 'white',
                color: filter === f ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                fontSize: 11, fontWeight: filter === f ? 500 : 400, cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {filteredRequests.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: 13 }}>
          All caught up
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredRequests.map((request) => {
            const expertise = getExpertiseArea(request.expertise_area_id);
            const daysLeft = Math.ceil((new Date(request.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={request.id}
                onClick={() => navigate(`/request/${request.id}`)}
                style={{
                  background: request.status === 'pending' ? 'white' : 'var(--color-neutral-50)',
                  border: '1px solid',
                  borderColor: request.status === 'pending' ? 'var(--color-warning-100)' : 'var(--color-neutral-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary-200)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = request.status === 'pending' ? 'var(--color-warning-100)' : 'var(--color-neutral-200)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-900)' }}>{request.title}</span>
                  <StatusBadge status={request.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-neutral-400)' }}>
                  <DecisionTypeBadge type={request.decision_type} />
                  <span>{request.requester_type === 'pm' ? 'PM' : 'Dev'}</span>
                  {expertise && <span>{expertise.name}</span>}
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, color: daysLeft <= 2 ? 'var(--color-error-500)' : undefined }}>
                    <Clock size={10} />
                    {daysLeft > 0 ? `${daysLeft}d` : 'Overdue'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
