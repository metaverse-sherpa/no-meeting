import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Coins } from 'lucide-react';
import {
  getCurrentUser,
  subscribe,
  getReviewers,
  getExpertiseForReviewer,
  createRequest,
} from '../lib/store';
import type { DecisionType, RequesterType } from '../types';

export function NewRequest() {
  const [, setRerender] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const user = getCurrentUser();
  const reviewers = getReviewers();

  const [title, setTitle] = useState('');
  const [decisionType, setDecisionType] = useState<DecisionType>('approval');
  const [requesterType, setRequesterType] = useState<RequesterType>(
    user.title.toLowerCase().includes('developer') || user.title.toLowerCase().includes('engineer')
      ? 'developer'
      : 'pm'
  );
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [context, setContext] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const reviewerExpertise = selectedReviewer ? getExpertiseForReviewer(selectedReviewer) : [];
  const selectedExpertiseArea = reviewerExpertise.find((e) => e.id === selectedExpertise);

  const canSubmit =
    title.trim() &&
    selectedReviewer &&
    selectedExpertise &&
    context.trim() &&
    deadline &&
    user.token_balance > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const request = createRequest({
        requester_id: user.id,
        reviewer_id: selectedReviewer,
        expertise_area_id: selectedExpertise,
        title: title.trim(),
        decision_type: decisionType,
        requester_type: requesterType,
        context: context.trim(),
        alternatives_considered: alternatives.trim(),
        deadline,
      });
      navigate(`/request/${request.id}`);
    } catch (err) {
      setError('Failed to create request. Please try again.');
    }
  };

  if (user.token_balance <= 0) {
    return (
      <div>
        <h1 style={{ marginBottom: 16 }}>New Decision Request</h1>
        <div
          style={{
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-100)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            textAlign: 'center',
          }}
        >
          <Coins size={32} style={{ color: 'var(--color-warning-500)', marginBottom: 12 }} />
          <h3 style={{ marginBottom: 8 }}>No tokens remaining</h3>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>
            You've used all your tokens for this period. Tokens reset weekly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 4 }}>New Decision Request</h1>
        <p style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>
          Spend 1 token to get an async decision. No meeting required.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
          }}
        >
          {/* Token cost indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 24,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-primary-700)',
            }}
          >
            <Coins size={16} />
            This request will cost 1 token (balance: {user.token_balance})
          </div>

          {/* Requester type */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>You are a</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['pm', 'developer'] as RequesterType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRequesterType(type)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: '1px solid',
                    borderColor:
                      requesterType === type ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    background: requesterType === type ? 'var(--color-primary-50)' : 'white',
                    color:
                      requesterType === type ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                    fontWeight: requesterType === type ? 500 : 400,
                    fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                >
                  {type === 'pm' ? 'Product/Delivery Manager' : 'Developer'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Decision needed</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                requesterType === 'pm'
                  ? 'e.g. Prioritize mobile app over web dashboard'
                  : 'e.g. Use EventBridge instead of SQS for order events'
              }
              style={inputStyle}
            />
          </div>

          {/* Decision type */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>What type of decision?</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(
                [
                  ['approval', 'Approval', 'Can I proceed with this?'],
                  ['sign_off', 'Sign-off', 'Is this approach acceptable?'],
                  ['feedback', 'Feedback', 'I need input, not necessarily approval'],
                  ['blocking_concern', 'Blocking Concern', 'I think this is risky'],
                ] as [DecisionType, string, string][]
              ).map(([type, label, desc]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDecisionType(type)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid',
                    borderColor:
                      decisionType === type ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    background: decisionType === type ? 'var(--color-primary-50)' : 'white',
                    color:
                      decisionType === type ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                    fontWeight: decisionType === type ? 500 : 400,
                    fontSize: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer + Expertise */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Who should review?</label>
              <select
                value={selectedReviewer}
                onChange={(e) => {
                  setSelectedReviewer(e.target.value);
                  setSelectedExpertise('');
                }}
                style={selectStyle}
              >
                <option value="">Select a reviewer</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} - {r.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Expertise area</label>
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                style={selectStyle}
                disabled={!selectedReviewer}
              >
                <option value="">Select an area</option>
                {reviewerExpertise.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.weekly_capacity - e.tokens_received_this_week} slots left)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedExpertiseArea && (
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--color-neutral-50)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                color: 'var(--color-neutral-500)',
                marginBottom: 20,
              }}
            >
              {selectedExpertiseArea.description}
            </div>
          )}

          {/* Context */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              {requesterType === 'developer' ? 'Proposed approach & reasoning' : 'Context & rationale'}
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={
                requesterType === 'developer'
                  ? 'Describe your proposed approach, why you chose it, and what problem it solves...'
                  : 'Explain the situation, what you need decided, and why...'
              }
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Alternatives */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Alternatives considered <span style={{ fontWeight: 400, color: 'var(--color-neutral-400)' }}>(optional)</span>
            </label>
            <textarea
              value={alternatives}
              onChange={(e) => setAlternatives(e.target.value)}
              placeholder="What other options did you consider? Why were they not chosen?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Response needed by</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--color-error-50)',
                color: 'var(--color-error-600)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                color: 'var(--color-neutral-600)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                background: canSubmit ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
                color: canSubmit ? 'white' : 'var(--color-neutral-400)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.15s',
              }}
            >
              <Send size={16} />
              Submit Request (1 Token)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--color-neutral-700)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--color-neutral-200)',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  color: 'var(--color-neutral-800)',
  background: 'white',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
};
