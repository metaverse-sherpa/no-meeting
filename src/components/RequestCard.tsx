import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { DecisionRequest } from '../types';
import { getProfile, getExpertiseArea } from '../lib/store';
import { StatusBadge, DecisionTypeBadge } from './StatusBadge';

export function RequestCard({ request }: { request: DecisionRequest }) {
  const navigate = useNavigate();
  const requester = getProfile(request.requester_id);
  const expertise = getExpertiseArea(request.expertise_area_id);

  const daysLeft = Math.ceil(
    (new Date(request.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={() => navigate(`/request/${request.id}`)}
      style={{
        background: 'white',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: 'var(--radius-md)',
        padding: 14,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary-200)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-200)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-900)' }}>
          {request.title}
        </span>
        <StatusBadge status={request.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-neutral-400)' }}>
        <DecisionTypeBadge type={request.decision_type} />
        <span>{request.requester_type === 'pm' ? 'PM' : 'Dev'}</span>
        {expertise && <span>{expertise.name}</span>}
        <span>by {requester?.full_name}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, color: daysLeft <= 2 ? 'var(--color-error-500)' : undefined, fontWeight: daysLeft <= 2 ? 500 : 400 }}>
          <Clock size={10} />
          {daysLeft > 0 ? `${daysLeft}d` : 'Overdue'}
        </span>
      </div>
    </div>
  );
}
