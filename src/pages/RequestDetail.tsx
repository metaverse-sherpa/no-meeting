import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, CircleCheck as CheckCircle, Circle as XCircle, Circle as HelpCircle, Lightbulb } from 'lucide-react';
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
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ color: 'var(--color-neutral-400)', fontSize: 13 }}>Request not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--color-primary-600)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Back</button>
      </div>
    );
  }

  const requester = getProfile(request.requester_id);
  const reviewer = getProfile(request.reviewer_id);
  const expertise = getExpertiseArea(request.expertise_area_id);
  const responses = getResponsesForRequest(request.id);
  const isReviewer = user.id === request.reviewer_id;
  const canRespond = isReviewer && ['pending', 'needs_info', 'in_review'].includes(request.status);

  const daysLeft = Math.ceil((new Date(request.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--color-neutral-400)', fontSize: 12, marginBottom: 16, cursor: 'pointer', padding: 0 }}>
        <ArrowLeft size={12} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, lineHeight: '130%' }}>{request.title}</h1>
        <StatusBadge status={request.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <DecisionTypeBadge type={request.decision_type} />
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-500)' }}>
          {request.requester_type === 'pm' ? 'PM' : 'Dev'}
        </span>
        {expertise && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-500)' }}>{expertise.name}</span>}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-neutral-400)', marginBottom: 16, flexWrap: 'wrap' }}>
        <span>From {requester?.full_name}</span>
        <span>to {reviewer?.full_name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: daysLeft <= 2 ? 'var(--color-error-500)' : undefined }}>
          <Clock size={11} />
          {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
        </span>
      </div>

      {/* Notion link */}
      {request.notion_link && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--color-primary-50)', borderRadius: 6, marginBottom: 14, fontSize: 12 }}>
          <ExternalLink size={12} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
          <a href={request.notion_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', wordBreak: 'break-all', fontSize: 12 }}>
            Notion document
          </a>
        </div>
      )}

      {/* Context */}
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: 6 }}>
          {request.requester_type === 'developer' ? 'Proposed approach' : 'Context'}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>
          {request.context}
        </p>
      </div>

      {/* Alternatives */}
      {request.alternatives_considered && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: 6 }}>Alternatives</h3>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>
            {request.alternatives_considered}
          </p>
        </div>
      )}

      {/* Responses */}
      {responses.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: 8 }}>Responses</h3>
          {responses.map((resp) => {
            const respProfile = getProfile(resp.reviewer_id);
            return (
              <div key={resp.id} style={{ background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-700)' }}>{respProfile?.full_name}</span>
                  <ResponseTypeBadge type={resp.response_type} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>{resp.comment}</p>
                <div style={{ fontSize: 10, color: 'var(--color-neutral-400)', marginTop: 6 }}>{new Date(resp.created_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response form */}
      {canRespond && <ResponseForm requestId={request.id} />}
    </div>
  );
}

function ResponseForm({ requestId }: { requestId: string }) {
  const [responseType, setResponseType] = useState<ResponseType>('approved');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const options: { type: ResponseType; icon: React.ReactNode; label: string; color: string }[] = [
    { type: 'approved', icon: <CheckCircle size={13} />, label: 'Approve', color: 'var(--color-success-700)' },
    { type: 'needs_info', icon: <HelpCircle size={13} />, label: 'Need info', color: 'var(--color-warning-600)' },
    { type: 'feedback', icon: <Lightbulb size={13} />, label: 'Feedback', color: 'var(--color-primary-600)' },
    { type: 'rejected', icon: <XCircle size={13} />, label: 'Reject', color: 'var(--color-error-600)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    respondToRequest(requestId, responseType, comment.trim());
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: 14, background: 'var(--color-success-50)', border: '1px solid var(--color-success-100)', borderRadius: 6, fontSize: 13, color: 'var(--color-success-700)' }}>
        Response submitted. The requester has been notified.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 14 }}>
        <h3 style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: 8 }}>Your response</h3>

        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {options.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setResponseType(opt.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                border: '1px solid',
                borderColor: responseType === opt.type ? opt.color : 'var(--color-neutral-200)',
                borderRadius: 4,
                background: responseType === opt.type ? `${opt.color}10` : 'white',
                color: responseType === opt.type ? opt.color : 'var(--color-neutral-500)',
                fontSize: 11,
                fontWeight: responseType === opt.type ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            responseType === 'approved' ? 'What makes this a good approach?'
            : responseType === 'needs_info' ? 'What do you need to know?'
            : responseType === 'feedback' ? 'Your thoughts...'
            : 'Why should this not proceed?'
          }
          rows={3}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-neutral-200)', borderRadius: 6, fontSize: 13, color: 'var(--color-neutral-800)', resize: 'vertical', outline: 'none', marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={!comment.trim()}
          style={{
            padding: '6px 16px',
            background: comment.trim() ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
            color: comment.trim() ? 'white' : 'var(--color-neutral-400)',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            cursor: comment.trim() ? 'pointer' : 'default',
          }}
        >
          Submit
        </button>
      </div>
    </form>
  );
}
