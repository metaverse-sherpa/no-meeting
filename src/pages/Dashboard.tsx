import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Inbox, Coins, Calendar, Zap, X, ArrowRight } from 'lucide-react';
import { useApp } from '../lib/context';
import { RequestCard } from '../components/RequestCard';
import { getDetectedMeetings, updateDetectedMeeting, formatScheduled, type DetectedMeeting } from '../lib/calendar-mock';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, myRequests, reviewRequests } = useApp();

  const [detectedMeetings, setDetectedMeetings] = useState<DetectedMeeting[]>([]);
  const calendarConnected = localStorage.getItem('crux-google-connected') !== 'false';

  useEffect(() => {
    if (calendarConnected) setDetectedMeetings(getDetectedMeetings());
  }, [calendarConnected]);

  if (!profile) return null;

  const isRequester = profile.role === 'requester' || profile.role === 'both';
  const isReviewer = profile.role === 'reviewer' || profile.role === 'both';

  const pendingReview = reviewRequests.filter((r) => r.status === 'pending');
  const meetingsSaved = myRequests.filter((r) => r.responded_at).length;

  const activeMeetings = detectedMeetings.filter((m) => !m.dismissed && !m.converted);

  const handleDismiss = (id: string) => {
    const updated = updateDetectedMeeting(id, { dismissed: true });
    setDetectedMeetings(updated);
  };

  const handleConvert = (meeting: DetectedMeeting) => {
    updateDetectedMeeting(meeting.id, { converted: true });
    setDetectedMeetings(getDetectedMeetings());
    navigate('/request/new');
  };

  return (
    <div>
      {/* Detected meetings from calendar sync */}
      {calendarConnected && activeMeetings.length > 0 && (
        <div style={{
          marginBottom: 24,
          border: '1px solid var(--color-warning-100)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-warning-50)',
          overflow: 'hidden',
          animation: 'fadein 0.25s ease',
        }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--color-warning-100)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 500, color: 'var(--color-warning-600)',
          }}>
            <Zap size={13} />
            {activeMeetings.length} calendar meeting{activeMeetings.length !== 1 ? 's' : ''} could be a CRUX request
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-neutral-400)', marginLeft: 4 }}>
              · detected via Google Calendar
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeMeetings.map((m, i) => (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: i < activeMeetings.length - 1 ? '1px solid var(--color-warning-100)' : 'none',
                  background: 'white',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Calendar size={13} style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 1 }}>
                      {m.attendees} people · {m.duration_min} min · {formatScheduled(m.scheduled_at)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleConvert(m)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 11px',
                      background: 'var(--color-primary-600)', color: 'white',
                      border: 'none', borderRadius: 5,
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Convert to CRUX
                    <ArrowRight size={10} />
                  </button>
                  <button
                    onClick={() => handleDismiss(m.id)}
                    title="Dismiss"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24,
                      background: 'none', border: 'none',
                      color: 'var(--color-neutral-300)', cursor: 'pointer', borderRadius: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-neutral-500)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-300)')}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              No requests yet. Spend a token to get a CRUX decision.
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
