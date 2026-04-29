import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, CircleCheck as CheckCircle, Clock } from 'lucide-react';
import {
  getCurrentUser,
  subscribe,
  getRequestsForReviewer,
  getProfile,
  getExpertiseArea,
} from '../lib/store';
import { StatusBadge, DecisionTypeBadge } from '../components/StatusBadge';
import type { RequestStatus } from '../types';

export function ReviewerInbox() {
  const [, setRerender] = useState(0);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const user = getCurrentUser();
  const allRequests = getRequestsForReviewer(user.id);

  const filteredRequests =
    filter === 'all' ? allRequests : allRequests.filter((r) => r.status === filter);

  const pending = allRequests.filter((r) => r.status === 'pending').length;
  const inReview = allRequests.filter((r) => r.status === 'in_review' || r.status === 'needs_info').length;
  const resolved = allRequests.filter((r) => r.status === 'approved' || r.status === 'rejected').length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Inbox size={24} style={{ color: 'var(--color-primary-600)' }} />
          Review Inbox
        </h1>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>
          Async decisions waiting for your input. No meetings needed.
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: pending > 0 ? 'var(--color-warning-50)' : 'var(--color-neutral-50)',
            border: '1px solid',
            borderColor: pending > 0 ? 'var(--color-warning-100)' : 'var(--color-neutral-200)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: pending > 0 ? 'var(--color-warning-600)' : 'var(--color-neutral-400)' }}>
            {pending}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>Pending</div>
        </div>
        <div
          style={{
            background: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-100)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary-700)' }}>{inReview}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>In Review</div>
        </div>
        <div
          style={{
            background: 'var(--color-success-50)',
            border: '1px solid var(--color-success-100)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success-700)' }}>{resolved}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>Resolved</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'in_review', 'needs_info', 'approved', 'rejected'] as const).map((f) => {
          const count = f === 'all' ? allRequests.length : allRequests.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                border: '1px solid',
                borderColor: filter === f ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                borderRadius: 20,
                background: filter === f ? 'var(--color-primary-50)' : 'white',
                color: filter === f ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                fontSize: 12,
                fontWeight: filter === f ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Request list */}
      {filteredRequests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            color: 'var(--color-neutral-400)',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-neutral-300)',
          }}
        >
          <CheckCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 15, marginBottom: 4 }}>All caught up</p>
          <p style={{ fontSize: 13 }}>No requests matching this filter</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRequests.map((request) => {
            const requester = getProfile(request.requester_id);
            const expertise = getExpertiseArea(request.expertise_area_id);
            const daysLeft = Math.ceil(
              (new Date(request.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={request.id}
                onClick={() => navigate(`/request/${request.id}`)}
                style={{
                  background: request.status === 'pending' ? 'white' : 'var(--color-neutral-50)',
                  border: '1px solid',
                  borderColor: request.status === 'pending' ? 'var(--color-warning-100)' : 'var(--color-neutral-200)',
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
                  e.currentTarget.style.borderColor =
                    request.status === 'pending' ? 'var(--color-warning-100)' : 'var(--color-neutral-200)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-neutral-900)' }}>
                    {request.title}
                  </h3>
                  <StatusBadge status={request.status} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
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
                    {request.requester_type === 'pm' ? 'PM' : 'Dev'}
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
                    marginBottom: 12,
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
                  <span>From {requester?.full_name}</span>
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
          })}
        </div>
      )}
    </div>
  );
}
