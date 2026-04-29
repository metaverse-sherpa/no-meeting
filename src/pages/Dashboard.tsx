import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Inbox, Clock, CircleCheck as CheckCircle, Coins, TrendingUp } from 'lucide-react';
import {
  getCurrentUser,
  subscribe,
  getRequestsForRequester,
  getRequestsForReviewer,
} from '../lib/store';
import { RequestCard } from '../components/RequestCard';

export function Dashboard() {
  const [, setRerender] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const user = getCurrentUser();
  const isRequester = user.role === 'requester' || user.role === 'both';
  const isReviewer = user.role === 'reviewer' || user.role === 'both';

  const myRequests = getRequestsForRequester(user.id);
  const reviewRequests = getRequestsForReviewer(user.id);
  const pendingReview = reviewRequests.filter((r) => r.status === 'pending');
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');
  const pendingRequests = myRequests.filter((r) => r.status === 'pending' || r.status === 'in_review' || r.status === 'needs_info');

  const meetingsSaved = myRequests.filter((r) => r.status !== 'pending' || r.responded_at).length;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 4 }}>Welcome back, {user.full_name.split(' ')[0]}</h1>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: 15 }}>
          {isRequester && isReviewer
            ? 'Manage your requests and review decisions from your team.'
            : isRequester
            ? 'Track your decision requests and spend tokens wisely.'
            : 'Review pending decisions from your team.'}
        </p>
      </div>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {isRequester && (
          <>
            <StatCard
              icon={<Coins size={18} />}
              value={user.token_balance}
              label="Tokens Remaining"
              accent="var(--color-primary-600)"
              bg="var(--color-primary-50)"
            />
            <StatCard
              icon={<Clock size={18} />}
              value={pendingRequests.length}
              label="Pending Requests"
              accent="var(--color-warning-600)"
              bg="var(--color-warning-50)"
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              value={approvedRequests.length}
              label="Approved"
              accent="var(--color-success-700)"
              bg="var(--color-success-50)"
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              value={meetingsSaved}
              label="Meetings Saved"
              accent="var(--color-accent-600)"
              bg="var(--color-accent-50)"
            />
          </>
        )}
        {isReviewer && (
          <>
            <StatCard
              icon={<Inbox size={18} />}
              value={pendingReview.length}
              label="Pending Reviews"
              accent="var(--color-error-500)"
              bg="var(--color-error-50)"
            />
            <StatCard
              icon={<CheckCircle size={18} />}
              value={reviewRequests.filter((r) => r.status === 'approved' || r.status === 'rejected').length}
              label="Decisions Made"
              accent="var(--color-success-700)"
              bg="var(--color-success-50)"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      {isRequester && (
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/request/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'var(--color-primary-600)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-700)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary-600)')}
          >
            <Send size={16} />
            New Decision Request
          </button>
        </div>
      )}

      {/* Pending reviews (for reviewers) */}
      {isReviewer && pendingReview.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Inbox size={20} style={{ color: 'var(--color-error-500)' }} />
            Awaiting Your Review
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingReview.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        </div>
      )}

      {/* My requests */}
      {isRequester && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Your Requests</h2>
          {myRequests.length === 0 ? (
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
              <Send size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: 15, marginBottom: 4 }}>No requests yet</p>
              <p style={{ fontSize: 13 }}>Spend a token to get a decision from a leader</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myRequests.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent: string;
  bg: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
