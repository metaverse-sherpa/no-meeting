import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  User as UserIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import {
  subscribe,
  useStore,
  getProfile,
  getExpertiseArea,
  getResponsesForRequest,
  getCurrentUser,
  respondToRequest,
} from '../lib/store';
import { StatusBadge, DecisionTypeBadge, ResponseTypeBadge } from '../components/StatusBadge';
import type { ResponseType } from '../types';

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setRerender] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const state = useStore();
  const user = getCurrentUser();
  const request = state.requests.find((r) => r.id === id);

  if (!request) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: 'var(--color-neutral-400)' }}>Request not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, ...linkButtonStyle }}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const requester = getProfile(request.requester_id);
  const reviewer = getProfile(request.reviewer_id);
  const expertise = getExpertiseArea(request.expertise_area_id);
  const responses = getResponsesForRequest(request.id);
  const isReviewer = user.id === request.reviewer_id;
  const canRespond = isReviewer && (request.status === 'pending' || request.status === 'needs_info' || request.status === 'in_review');

  const daysLeft = Math.ceil(
    (new Date(request.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--color-neutral-500)',
          fontSize: 13,
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, lineHeight: '130%' }}>{request.title}</h1>
          <StatusBadge status={request.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
      </div>

      {/* Meta info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetaItem
          icon={<UserIcon size={14} />}
          label="Requester"
          value={requester?.full_name || 'Unknown'}
          sub={requester?.title}
        />
        <MetaItem
          icon={<UserIcon size={14} />}
          label="Reviewer"
          value={reviewer?.full_name || 'Unknown'}
          sub={reviewer?.title}
        />
        <MetaItem
          icon={<Clock size={14} />}
          label="Deadline"
          value={new Date(request.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          sub={daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
          subColor={daysLeft <= 2 ? 'var(--color-error-500)' : undefined}
        />
        <MetaItem
          label="Created"
          value={new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        />
      </div>

      {/* Context */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h3 style={{ marginBottom: 12, fontSize: 15 }}>
          {request.requester_type === 'developer' ? 'Proposed Approach' : 'Context'}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>
          {request.context}
        </p>
      </div>

      {/* Alternatives */}
      {request.alternatives_considered && (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>Alternatives Considered</h3>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>
            {request.alternatives_considered}
          </p>
        </div>
      )}

      {/* Responses */}
      {responses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>
            <MessageSquare size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Responses
          </h3>
          {responses.map((resp) => {
            const respProfile = getProfile(resp.reviewer_id);
            return (
              <div
                key={resp.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--color-primary-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-primary-700)',
                      }}
                    >
                      {respProfile?.full_name?.charAt(0) || '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-800)' }}>
                      {respProfile?.full_name}
                    </span>
                  </div>
                  <ResponseTypeBadge type={resp.response_type} />
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>
                  {resp.comment}
                </p>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 8 }}>
                  {new Date(resp.created_at).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response form for reviewer */}
      {canRespond && <ResponseForm requestId={request.id} />}
    </div>
  );
}

function ResponseForm({ requestId }: { requestId: string }) {
  const [responseType, setResponseType] = useState<ResponseType>('approved');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const responseOptions: { type: ResponseType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
    { type: 'approved', icon: <CheckCircle size={16} />, label: 'Approve', desc: 'This can proceed', color: 'var(--color-success-700)' },
    { type: 'needs_info', icon: <HelpCircle size={16} />, label: 'Need More Info', desc: 'I have questions first', color: 'var(--color-warning-600)' },
    { type: 'feedback', icon: <Lightbulb size={16} />, label: 'Feedback', desc: 'I have thoughts to share', color: 'var(--color-primary-600)' },
    { type: 'rejected', icon: <XCircle size={16} />, label: 'Reject', desc: 'This should not proceed', color: 'var(--color-error-600)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    respondToRequest(requestId, responseType, comment.trim());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          background: 'var(--color-success-50)',
          border: '1px solid var(--color-success-100)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <CheckCircle size={24} style={{ color: 'var(--color-success-600)', marginBottom: 8 }} />
        <p style={{ fontWeight: 500, color: 'var(--color-success-700)' }}>Response submitted</p>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 4 }}>
          The requester has been notified of your decision.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: 'white',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
        }}
      >
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>Your Response</h3>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {responseOptions.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setResponseType(opt.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                border: '1px solid',
                borderColor: responseType === opt.type ? opt.color : 'var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                background: responseType === opt.type ? `${opt.color}10` : 'white',
                color: responseType === opt.type ? opt.color : 'var(--color-neutral-600)',
                fontWeight: responseType === opt.type ? 500 : 400,
                fontSize: 12,
                transition: 'all 0.15s',
              }}
            >
              {opt.icon}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
            Your reasoning
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              responseType === 'approved'
                ? 'What makes this a good approach? Any conditions?'
                : responseType === 'needs_info'
                ? 'What do you need to know before deciding?'
                : responseType === 'feedback'
                ? 'Share your thoughts and suggestions...'
                : 'Why should this not proceed? What are the risks?'
            }
            rows={4}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              color: 'var(--color-neutral-800)',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={!comment.trim()}
            style={{
              padding: '10px 24px',
              background: comment.trim() ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
              color: comment.trim() ? 'white' : 'var(--color-neutral-400)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
          >
            Submit Response
          </button>
        </div>
      </div>
    </form>
  );
}

function MetaItem({
  icon,
  label,
  value,
  sub,
  subColor,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--color-neutral-200)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-neutral-800)' }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12, color: subColor || 'var(--color-neutral-400)', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-primary-600)',
  fontSize: 14,
  cursor: 'pointer',
  textDecoration: 'underline',
};
