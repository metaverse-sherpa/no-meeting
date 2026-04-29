import { useNavigate } from 'react-router-dom';
import { Clock, User as UserIcon } from 'lucide-react';
import type { DecisionRequest } from '../types';
import { getProfile, getExpertiseArea } from '../lib/store';
import { StatusBadge, DecisionTypeBadge } from './StatusBadge';

export function RequestCard({ request }: { request: DecisionRequest }) {
  const navigate = useNavigate();
  const requester = getProfile(request.requester_id);
  const reviewer = getProfile(request.reviewer_id);
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
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-primary-200)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-neutral-900)', lineHeight: '140%' }}>
          {request.title}
        </h3>
        <StatusBadge status={request.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <DecisionTypeBadge type={request.decision_type} />
        <span
          style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 20,
            background: 'var(--color-neutral-100)',
            color: 'var(--color-neutral-600)',
            fontWeight: 500,
          }}
        >
          {request.requester_type === 'pm' ? 'PM Request' : 'Dev Request'}
        </span>
        {expertise && (
          <span
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 20,
              background: 'var(--color-neutral-100)',
              color: 'var(--color-neutral-600)',
            }}
          >
            {expertise.name}
          </span>
        )}
      </div>

      <p
        style={{
          fontSize: 13,
          color: 'var(--color-neutral-500)',
          lineHeight: '150%',
          marginBottom: 14,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {request.context}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--color-neutral-400)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserIcon size={12} />
            {requester?.full_name}
          </span>
          <span style={{ color: 'var(--color-neutral-300)' }}>to</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserIcon size={12} />
            {reviewer?.full_name}
          </span>
        </div>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: daysLeft <= 2 ? 'var(--color-error-500)' : 'var(--color-neutral-400)',
            fontWeight: daysLeft <= 2 ? 500 : 400,
          }}
        >
          <Clock size={12} />
          {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
        </span>
      </div>
    </div>
  );
}
