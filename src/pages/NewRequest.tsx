import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Coins, Link, Loader as Loader2, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Calendar } from 'lucide-react';
import { useApp } from '../lib/context';
import { isNotionUrl } from '../lib/notion-extract';
import { extractNotionViaEdge } from '../lib/db';
import { calculateMeetingCost, formatMeetingCost } from '../lib/meeting-calculator';
import type { DecisionType, RequesterType } from '../types';

type ExtractStatus = 'idle' | 'loading' | 'success' | 'error';

export function NewRequest() {
  const navigate = useNavigate();
  const { profile, getReviewers, getExpertiseForReviewer, createRequest } = useApp();

  const reviewers = getReviewers();

  const [notionLink, setNotionLink] = useState('');
  const [extractStatus, setExtractStatus] = useState<ExtractStatus>('idle');
  const [extractError, setExtractError] = useState('');
  const [title, setTitle] = useState('');
  const [decisionType, setDecisionType] = useState<DecisionType>('approval');
  const [requesterType, setRequesterType] = useState<RequesterType>(
    (profile?.title ?? '').toLowerCase().includes('developer') || (profile?.title ?? '').toLowerCase().includes('engineer')
      ? 'developer'
      : 'pm'
  );
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [context, setContext] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [showMeetingCheck, setShowMeetingCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reviewerExpertise = selectedReviewer ? getExpertiseForReviewer(selectedReviewer) : [];

  const canSubmit =
    title.trim() &&
    selectedReviewer &&
    selectedExpertise &&
    context.trim() &&
    deadline &&
    (profile?.token_balance ?? 0) > 0;

  const handleExtractNotion = useCallback(async (url: string) => {
    if (!isNotionUrl(url)) { setExtractStatus('idle'); return; }
    setExtractStatus('loading');
    setExtractError('');
    try {
      const result = await extractNotionViaEdge(url);
      if (result.title) setTitle(result.title);
      if (result.content) setContext(result.content);
      if (result.alternatives) setAlternatives(result.alternatives);
      if (result.decisionType) setDecisionType(result.decisionType as DecisionType);
      if (result.deadline) setDeadline(result.deadline);
      setExtractStatus('success');
    } catch {
      setExtractStatus('error');
      setExtractError('Could not extract from this Notion page. It may be private. Fill in the form manually.');
    }
  }, []);

  useEffect(() => {
    if (!notionLink.trim()) { setExtractStatus('idle'); return; }
    const timer = setTimeout(() => handleExtractNotion(notionLink.trim()), 800);
    return () => clearTimeout(timer);
  }, [notionLink, handleExtractNotion]);

  const submitRequest = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const req = await createRequest({
        reviewer_id: selectedReviewer,
        expertise_area_id: selectedExpertise,
        title: title.trim(),
        decision_type: decisionType,
        requester_type: requesterType,
        context: context.trim(),
        alternatives_considered: alternatives.trim(),
        deadline,
        notion_link: notionLink.trim() || undefined,
      });
      navigate(`/request/${req.id}`);
    } catch {
      setError('Failed to create request. Please try again.');
      setSubmitting(false);
    }
  };

  if (!profile) return null;

  if (profile.token_balance <= 0) {
    return (
      <div>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>No tokens remaining</h1>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>
          You've used all your tokens for this period. Tokens reset weekly.
        </p>
      </div>
    );
  }

  const complexity = context.length < 200 ? 'simple' : context.length > 500 ? 'complex' : 'moderate';
  const meetingCost = calculateMeetingCost(complexity, 3);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20 }}>New Request</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '3px 10px', borderRadius: 6 }}>
          <Coins size={12} />
          {profile.token_balance} tokens
        </div>
      </div>

      {/* Notion link */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          <Link size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} />
          Notion link <span style={{ fontWeight: 400, color: 'var(--color-neutral-400)' }}>(auto-fills form)</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="url"
            value={notionLink}
            onChange={(e) => setNotionLink(e.target.value)}
            placeholder="https://www.notion.so/..."
            style={{
              ...inputStyle, paddingRight: 36,
              borderColor: extractStatus === 'success' ? 'var(--color-success-500)' : extractStatus === 'error' ? 'var(--color-error-500)' : undefined,
            }}
          />
          {extractStatus === 'loading' && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><Loader2 size={14} style={{ color: 'var(--color-primary-500)', animation: 'spin 1s linear infinite' }} /></div>}
          {extractStatus === 'success' && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><CheckCircle size={14} style={{ color: 'var(--color-success-500)' }} /></div>}
          {extractStatus === 'error' && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><AlertCircle size={14} style={{ color: 'var(--color-error-500)' }} /></div>}
        </div>
        {extractStatus === 'success' && <div style={{ fontSize: 11, color: 'var(--color-success-700)', marginTop: 4 }}>Extracted from Notion</div>}
        {extractStatus === 'error' && <div style={{ fontSize: 11, color: 'var(--color-error-600)', marginTop: 4 }}>{extractError}</div>}
      </div>

      {/* Requester type */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['pm', 'developer'] as RequesterType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRequesterType(type)}
              style={{
                padding: '5px 12px', border: '1px solid',
                borderColor: requesterType === type ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                borderRadius: 4,
                background: requesterType === type ? 'var(--color-primary-50)' : 'white',
                color: requesterType === type ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                fontSize: 12, fontWeight: requesterType === type ? 500 : 400, cursor: 'pointer',
              }}
            >
              {type === 'pm' ? 'PM' : 'Developer'}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Decision needed</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={requesterType === 'pm' ? 'e.g. Prioritize mobile app over web dashboard' : 'e.g. Use EventBridge instead of SQS'}
          style={inputStyle}
        />
      </div>

      {/* Decision type */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(
            [['approval', 'Approval'], ['sign_off', 'Sign-off'], ['feedback', 'Feedback'], ['blocking_concern', 'Blocker']] as [DecisionType, string][]
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setDecisionType(type)}
              style={{
                padding: '4px 10px', border: '1px solid',
                borderColor: decisionType === type ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                borderRadius: 4,
                background: decisionType === type ? 'var(--color-primary-50)' : 'white',
                color: decisionType === type ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                fontSize: 11, fontWeight: decisionType === type ? 500 : 400, cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviewer + Expertise */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Reviewer</label>
          <select
            value={selectedReviewer}
            onChange={(e) => { setSelectedReviewer(e.target.value); setSelectedExpertise(''); }}
            style={selectStyle}
          >
            <option value="">Select</option>
            {reviewers.filter((r) => r.id !== profile.id).map((r) => (
              <option key={r.id} value={r.id}>{r.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Expertise</label>
          <select
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
            style={selectStyle}
            disabled={!selectedReviewer}
          >
            <option value="">Select</option>
            {reviewerExpertise.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.weekly_capacity - e.tokens_received_this_week} left)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Context */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          {requesterType === 'developer' ? 'Proposed approach' : 'Context'}
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={requesterType === 'developer' ? 'Describe your approach and why...' : 'What needs deciding and why...'}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Alternatives */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          Alternatives <span style={{ fontWeight: 400, color: 'var(--color-neutral-400)' }}>(optional)</span>
        </label>
        <textarea
          value={alternatives}
          onChange={(e) => setAlternatives(e.target.value)}
          placeholder="What else did you consider?"
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Deadline */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Needed by</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          style={inputStyle}
        />
      </div>

      {error && (
        <div style={{ padding: '8px 12px', background: 'var(--color-error-50)', color: 'var(--color-error-600)', borderRadius: 4, fontSize: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {canSubmit && !showMeetingCheck && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-md)', marginBottom: 12,
          fontSize: 12, color: 'var(--color-neutral-500)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} />
            A meeting for this would cost {formatMeetingCost(meetingCost)}
          </span>
          <button
            type="button"
            onClick={() => setShowMeetingCheck(true)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Why async?
          </button>
        </div>
      )}

      {showMeetingCheck && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
          borderRadius: 'var(--radius-md)', marginBottom: 12,
          fontSize: 12, color: 'var(--color-primary-700)', lineHeight: '150%',
        }}>
          A {meetingCost.meetingMinutes}m meeting with {meetingCost.attendeeCount} people = {formatMeetingCost(meetingCost)} of focused time (including prep + context switching).
          This async request costs 1 token and {meetingCost.asyncAlternativeMinutes}m of your time. No interruptions for anyone else.
          <button
            type="button"
            onClick={() => setShowMeetingCheck(false)}
            style={{ display: 'block', marginTop: 6, background: 'none', border: 'none', color: 'var(--color-primary-600)', fontSize: 11, cursor: 'pointer', padding: 0 }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px', background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-md)', fontSize: 12,
            color: 'var(--color-neutral-500)', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submitRequest}
          disabled={!canSubmit || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 20px',
            background: canSubmit && !submitting ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
            color: canSubmit && !submitting ? 'white' : 'var(--color-neutral-400)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 12, fontWeight: 500,
            cursor: canSubmit && !submitting ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
        >
          <Send size={13} />
          {submitting ? 'Sending...' : 'Send (1 Token)'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--color-neutral-600)', marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--color-neutral-200)',
  borderRadius: 6, fontSize: 13,
  color: 'var(--color-neutral-800)', background: 'white',
  outline: 'none', transition: 'border-color 0.15s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 28,
};
