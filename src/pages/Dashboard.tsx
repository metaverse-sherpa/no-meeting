import { useNavigate } from 'react-router-dom';
import { Send, Inbox, Coins, Calendar } from 'lucide-react';
import { useApp } from '../lib/context';
import { RequestCard } from '../components/RequestCard';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, myRequests, reviewRequests } = useApp();

  if (!profile) return null;

  const isRequester = profile.role === 'requester' || profile.role === 'both';
  const isReviewer = profile.role === 'reviewer' || profile.role === 'both';

  const pendingReview = reviewRequests.filter((r) => r.status === 'pending');
  const meetingsSaved = myRequests.filter((r) => r.responded_at).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {isRequester && (
          <button
            onClick={() => navigate('/request/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: 'var(--color-primary-600)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-700)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary-600)')}
          >
            <Send size={13} />
            New Request
          </button>
        )}
        <button
          onClick={() => navigate('/interrupt')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px',
            background: 'white', border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-600)',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary-300)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-200)')}
        >
          <Calendar size={13} />
          Meeting Check
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {isRequester && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-neutral-500)' }}>
            <Coins size={13} style={{ color: 'var(--color-primary-500)' }} />
            <strong style={{ color: 'var(--color-neutral-800)' }}>{profile.token_balance}</strong> tokens left
          </div>
        )}
        {isReviewer && pendingReview.length > 0 && (
          <button
            onClick={() => navigate('/inbox')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--color-error-600)',
              background: 'var(--color-error-50)',
              border: 'none', borderRadius: 4,
              padding: '2px 8px', cursor: 'pointer', fontWeight: 500,
            }}
          >
            <Inbox size={13} />
            {pendingReview.length} pending review{pendingReview.length !== 1 ? 's' : ''}
          </button>
        )}
        {meetingsSaved > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-accent-600)' }}>
            <Calendar size={13} />
            {meetingsSaved} meeting{meetingsSaved !== 1 ? 's' : ''} saved
          </div>
        )}
      </div>

      {isReviewer && pendingReview.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: 'var(--color-neutral-700)' }}>
            Awaiting your review
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingReview.map((r) => <RequestCard key={r.id} request={r} />)}
          </div>
        </div>
      )}

      {isRequester && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: 'var(--color-neutral-700)' }}>
            Your requests
          </h2>
          {myRequests.length === 0 ? (
            <div style={{
              padding: 32, textAlign: 'center',
              color: 'var(--color-neutral-400)',
              border: '1px dashed var(--color-neutral-300)',
              borderRadius: 'var(--radius-md)', fontSize: 13,
            }}>
              No requests yet. Spend a token to get an async decision.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myRequests.map((r) => <RequestCard key={r.id} request={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
