import { Calendar, Clock, CircleCheck as CheckCircle, Coins } from 'lucide-react';
import { useApp } from '../lib/context';

export function Analytics() {
  const { profile, myRequests, reviewRequests, getProfile } = useApp();

  if (!profile) return null;

  const isRequester = profile.role === 'requester' || profile.role === 'both';
  const isReviewer = profile.role === 'reviewer' || profile.role === 'both';

  const approved = myRequests.filter((r) => r.status === 'approved').length;
  const rejected = myRequests.filter((r) => r.status === 'rejected').length;
  const resolved = myRequests.filter((r) => r.responded_at);
  const meetingsSaved = resolved.length;
  const totalResolved = approved + rejected;
  const approvalRate = totalResolved > 0 ? Math.round((approved / totalResolved) * 100) : 0;

  const responseTimes = resolved
    .filter((r) => r.responded_at)
    .map((r) => (new Date(r.responded_at!).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60));
  const avgHours = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

  const reviewApproved = reviewRequests.filter((r) => r.status === 'approved').length;
  const reviewRejected = reviewRequests.filter((r) => r.status === 'rejected').length;

  const spending: Record<string, { name: string; count: number }> = {};
  myRequests.forEach((r) => {
    const p = getProfile(r.reviewer_id);
    const name = p?.full_name || 'Unknown';
    if (!spending[r.reviewer_id]) spending[r.reviewer_id] = { name, count: 0 };
    spending[r.reviewer_id].count += r.tokens_spent;
  });

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Analytics</h1>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        {isRequester && (
          <>
            <Metric value={meetingsSaved} label="meetings saved" icon={<Calendar size={13} />} />
            <Metric value={avgHours > 24 ? `${(avgHours / 24).toFixed(1)}d` : `${Math.round(avgHours)}h`} label="avg response" icon={<Clock size={13} />} />
            <Metric value={`${approvalRate}%`} label="approval rate" icon={<CheckCircle size={13} />} />
            <Metric value={profile.tokens_used_this_week} label="tokens used" icon={<Coins size={13} />} />
          </>
        )}
        {isReviewer && (
          <>
            <Metric value={reviewApproved + reviewRejected} label="decisions made" icon={<CheckCircle size={13} />} />
            <Metric value={reviewRequests.filter((r) => r.status === 'pending').length} label="pending" icon={<Clock size={13} />} />
          </>
        )}
      </div>

      {isRequester && Object.keys(spending).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-600)', marginBottom: 10 }}>Token spending</h2>
          {Object.values(spending)
            .sort((a, b) => b.count - a.count)
            .map((item) => {
              const max = Math.max(...Object.values(spending).map((s) => s.count));
              return (
                <div key={item.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                    <span style={{ color: 'var(--color-neutral-700)' }}>{item.name}</span>
                    <span style={{ color: 'var(--color-neutral-400)' }}>{item.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--color-neutral-100)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(item.count / max) * 100}%`, background: 'var(--color-primary-500)', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <div style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)', borderRadius: 'var(--radius-md)', padding: 14, fontSize: 12, color: 'var(--color-primary-700)', lineHeight: '160%' }}>
        {isRequester && (
          <p>You've made {myRequests.length} requests and saved ~{meetingsSaved} meeting{meetingsSaved !== 1 ? 's' : ''} by using CRUX.
            {avgHours > 0 && ` Average response: ${avgHours > 24 ? `${(avgHours / 24).toFixed(1)} days` : `${Math.round(avgHours)} hours`} vs. 3-7 days to schedule a meeting.`}
          </p>
        )}
        {isReviewer && (
          <p>You've made {reviewApproved + reviewRejected} CRUX decisions, saving your team ~{reviewApproved + reviewRejected} meeting{reviewApproved + reviewRejected !== 1 ? 's' : ''} of coordination.</p>
        )}
      </div>
    </div>
  );
}

function Metric({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ color: 'var(--color-neutral-400)' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{label}</div>
      </div>
    </div>
  );
}
