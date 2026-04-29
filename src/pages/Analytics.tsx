import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Coins,
  BarChart3,
} from 'lucide-react';
import {
  getCurrentUser,
  subscribe,
  getRequestsForRequester,
  getRequestsForReviewer,
  getProfile,
} from '../lib/store';

export function Analytics() {
  const [, setRerender] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const user = getCurrentUser();
  const isRequester = user.role === 'requester' || user.role === 'both';
  const isReviewer = user.role === 'reviewer' || user.role === 'both';

  const myRequests = getRequestsForRequester(user.id);
  const reviewRequests = getRequestsForReviewer(user.id);

  // Calculate metrics
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');
  const rejectedRequests = myRequests.filter((r) => r.status === 'rejected');
  const resolvedRequests = myRequests.filter((r) => r.responded_at);

  // Average response time (for resolved requests)
  const responseTimes = resolvedRequests
    .filter((r) => r.responded_at)
    .map((r) => {
      const created = new Date(r.created_at).getTime();
      const responded = new Date(r.responded_at!).getTime();
      return (responded - created) / (1000 * 60 * 60); // hours
    });
  const avgResponseHours = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  // Meetings saved estimate (each resolved request = 1 meeting avoided)
  const meetingsSaved = resolvedRequests.length;

  // Approval rate
  const totalResolved = approvedRequests.length + rejectedRequests.length;
  const approvalRate = totalResolved > 0
    ? Math.round((approvedRequests.length / totalResolved) * 100)
    : 0;

  // Reviewer stats
  const reviewApproved = reviewRequests.filter((r) => r.status === 'approved').length;
  const reviewRejected = reviewRequests.filter((r) => r.status === 'rejected').length;
  const reviewResolved = reviewApproved + reviewRejected;
  const reviewPending = reviewRequests.filter((r) => r.status === 'pending').length;

  // Token spending by reviewer
  const spendingByReviewer: Record<string, { name: string; count: number }> = {};
  myRequests.forEach((r) => {
    const profile = getProfile(r.reviewer_id);
    const name = profile?.full_name || 'Unknown';
    if (!spendingByReviewer[r.reviewer_id]) {
      spendingByReviewer[r.reviewer_id] = { name, count: 0 };
    }
    spendingByReviewer[r.reviewer_id].count += r.tokens_spent;
  });

  // Decision type breakdown
  const decisionTypes: Record<string, number> = {};
  myRequests.forEach((r) => {
    decisionTypes[r.decision_type] = (decisionTypes[r.decision_type] || 0) + 1;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={24} style={{ color: 'var(--color-primary-600)' }} />
          Analytics
        </h1>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>
          Track how token-based decisions reduce meetings and improve flow.
        </p>
      </div>

      {/* Key metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {isRequester && (
          <>
            <MetricCard
              icon={<TrendingUp size={18} />}
              value={meetingsSaved}
              label="Meetings Saved"
              sub="Each async decision = 1 meeting avoided"
              accent="var(--color-accent-600)"
              bg="var(--color-accent-50)"
            />
            <MetricCard
              icon={<Clock size={18} />}
              value={avgResponseHours > 24 ? `${(avgResponseHours / 24).toFixed(1)}d` : `${Math.round(avgResponseHours)}h`}
              label="Avg Response Time"
              sub="Time from request to decision"
              accent="var(--color-primary-600)"
              bg="var(--color-primary-50)"
            />
            <MetricCard
              icon={<CheckCircle size={18} />}
              value={`${approvalRate}%`}
              label="Approval Rate"
              sub={`${approvedRequests.length} approved, ${rejectedRequests.length} rejected`}
              accent="var(--color-success-700)"
              bg="var(--color-success-50)"
            />
            <MetricCard
              icon={<Coins size={18} />}
              value={`${user.tokens_used_this_week}`}
              label="Tokens Used This Week"
              sub={`${user.token_balance} remaining`}
              accent="var(--color-warning-600)"
              bg="var(--color-warning-50)"
            />
          </>
        )}
        {isReviewer && (
          <>
            <MetricCard
              icon={<CheckCircle size={18} />}
              value={reviewResolved}
              label="Decisions Made"
              sub={`${reviewApproved} approved, ${reviewRejected} rejected`}
              accent="var(--color-success-700)"
              bg="var(--color-success-50)"
            />
            <MetricCard
              icon={<Clock size={18} />}
              value={reviewPending}
              label="Pending Reviews"
              sub="Awaiting your input"
              accent="var(--color-warning-600)"
              bg="var(--color-warning-50)"
            />
          </>
        )}
      </div>

      {/* Spending breakdown */}
      {isRequester && Object.keys(spendingByReviewer).length > 0 && (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: 'var(--color-primary-600)' }} />
            Token Spending by Reviewer
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.values(spendingByReviewer)
              .sort((a, b) => b.count - a.count)
              .map((item) => {
                const maxTokens = Math.max(...Object.values(spendingByReviewer).map((s) => s.count));
                const pct = (item.count / maxTokens) * 100;
                return (
                  <div key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                        {item.count} token{item.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: 'var(--color-neutral-100)',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--color-primary-500)',
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Decision type breakdown */}
      {isRequester && Object.keys(decisionTypes).length > 0 && (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Decision Types</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(decisionTypes).map(([type, count]) => {
              const labels: Record<string, string> = {
                approval: 'Approval',
                sign_off: 'Sign-off',
                feedback: 'Feedback',
                blocking_concern: 'Blocking Concern',
              };
              const colors: Record<string, string> = {
                approval: 'var(--color-primary-500)',
                sign_off: 'var(--color-accent-500)',
                feedback: 'var(--color-warning-500)',
                blocking_concern: 'var(--color-error-500)',
              };
              return (
                <div
                  key={type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: 'var(--color-neutral-50)',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: colors[type] || 'var(--color-neutral-400)',
                    }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{labels[type] || type}</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-neutral-900)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impact summary */}
      <div
        style={{
          background: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-100)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 12, color: 'var(--color-primary-800)' }}>
          Impact Summary
        </h2>
        <div style={{ fontSize: 14, color: 'var(--color-primary-700)', lineHeight: '170%' }}>
          {isRequester && (
            <p>
              You've made <strong>{myRequests.length}</strong> decision requests and saved an estimated{' '}
              <strong>{meetingsSaved} meeting{meetingsSaved !== 1 ? 's' : ''}</strong> by using async tokens instead of scheduling sync time.
              {avgResponseHours > 0 && (
                <> Average response time is <strong>{avgResponseHours > 24 ? `${(avgResponseHours / 24).toFixed(1)} days` : `${Math.round(avgResponseHours)} hours`}</strong>, compared to the typical 3-7 day wait for a meeting slot.</>
              )}
            </p>
          )}
          {isReviewer && (
            <p>
              You've made <strong>{reviewResolved}</strong> decisions asynchronously, saving your team an estimated{' '}
              <strong>{reviewResolved} meeting{reviewResolved !== 1 ? 's' : ''}</strong> worth of coordination overhead.
              {reviewPending > 0 && (
                <> You have <strong>{reviewPending}</strong> pending review{reviewPending !== 1 ? 's' : ''} in your inbox.</>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  sub,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
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
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginTop: 4 }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}
