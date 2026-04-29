import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Coins, Link, Loader as Loader2, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';
import {
  getCurrentUser,
  subscribe,
  getReviewers,
  getExpertiseForReviewer,
  createRequest,
} from '../lib/store';
import { isNotionUrl, extractNotionPage } from '../lib/notion-extract';
import { calculateMeetingCost, formatMeetingCost, getMeetingComparisonMessage } from '../lib/meeting-calculator';
import type { DecisionType, RequesterType } from '../types';

type ExtractStatus = 'idle' | 'loading' | 'success' | 'error';

interface MeetingCheck {
  isOpen: boolean;
  complexity: 'simple' | 'moderate' | 'complex' | null;
  consideredMeeting: boolean | null;
}

export function NewRequest() {
  const [, setRerender] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribe(() => setRerender((n) => n + 1));
    return unsub;
  }, []);

  const user = getCurrentUser();
  const reviewers = getReviewers();

  const [notionLink, setNotionLink] = useState('');
  const [extractStatus, setExtractStatus] = useState<ExtractStatus>('idle');
  const [extractError, setExtractError] = useState('');
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
  const [meetingCheck, setMeetingCheck] = useState<MeetingCheck>({
    isOpen: false,
    complexity: null,
    consideredMeeting: null,
  });

  const reviewerExpertise = selectedReviewer ? getExpertiseForReviewer(selectedReviewer) : [];
  const selectedExpertiseArea = reviewerExpertise.find((e) => e.id === selectedExpertise);

  const canSubmit =
    title.trim() &&
    selectedReviewer &&
    selectedExpertise &&
    context.trim() &&
    deadline &&
    user.token_balance > 0;

  const handleExtractNotion = useCallback(async (url: string) => {
    if (!isNotionUrl(url)) {
      setExtractStatus('idle');
      return;
    }

    setExtractStatus('loading');
    setExtractError('');

    try {
      const result = await extractNotionPage(url);

      if (result.title) setTitle(result.title);
      if (result.content) setContext(result.content);
      if (result.alternatives) setAlternatives(result.alternatives);
      if (result.decisionType) setDecisionType(result.decisionType as DecisionType);
      if (result.deadline) setDeadline(result.deadline);

      setExtractStatus('success');
    } catch (err) {
      setExtractStatus('error');
      setExtractError(
        'Could not extract content from this Notion page. It may be private or require login. You can still paste the link and fill in the form manually.'
      );
    }
  }, []);

  // Debounced extraction on link change
  useEffect(() => {
    if (!notionLink.trim()) {
      setExtractStatus('idle');
      return;
    }

    const timer = setTimeout(() => {
      handleExtractNotion(notionLink.trim());
    }, 800);

    return () => clearTimeout(timer);
  }, [notionLink, handleExtractNotion]);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Infer complexity from context length and decision type
    const contextLength = context.length;
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    if (contextLength < 200) complexity = 'simple';
    if (contextLength > 500) complexity = 'complex';
    if (decisionType === 'blocking_concern') complexity = 'complex';

    setMeetingCheck({
      isOpen: true,
      complexity,
      consideredMeeting: null,
    });
  };

  const handleConfirmDecision = (consideredMeeting: boolean) => {
    if (consideredMeeting) {
      // User says they could do a meeting - show them the cost
      setMeetingCheck({
        ...meetingCheck,
        consideredMeeting: true,
      });
    } else {
      // User confirms async is right - submit
      submitRequest();
    }
  };

  const submitRequest = () => {
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
        notion_link: notionLink.trim() || undefined,
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

      <form onSubmit={(e) => { e.preventDefault(); }}>
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

          {/* Notion link */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              <Link size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Notion link <span style={{ fontWeight: 400, color: 'var(--color-neutral-400)' }}>(optional - auto-fills form)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                value={notionLink}
                onChange={(e) => setNotionLink(e.target.value)}
                placeholder="https://www.notion.so/your-team/decision-doc-..."
                style={{
                  ...inputStyle,
                  paddingRight: 40,
                  borderColor:
                    extractStatus === 'success'
                      ? 'var(--color-success-500)'
                      : extractStatus === 'error'
                      ? 'var(--color-error-500)'
                      : undefined,
                }}
              />
              {extractStatus === 'loading' && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <Loader2 size={16} style={{ color: 'var(--color-primary-500)', animation: 'spin 1s linear infinite' }} />
                </div>
              )}
              {extractStatus === 'success' && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <CheckCircle size={16} style={{ color: 'var(--color-success-500)' }} />
                </div>
              )}
              {extractStatus === 'error' && (
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--color-error-500)' }} />
                </div>
              )}
            </div>
            {extractStatus === 'success' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  fontSize: 12,
                  color: 'var(--color-success-700)',
                }}
              >
                <CheckCircle size={12} />
                Extracted title, context, and alternatives from Notion page
              </div>
            )}
            {extractStatus === 'error' && extractError && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: 'var(--color-error-600)',
                  lineHeight: '150%',
                }}
              >
                {extractError}
              </div>
            )}
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
              type="button"
              onClick={handlePreSubmit}
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

      {/* Meeting check modal */}
      {meetingCheck.isOpen && (
        <MeetingCheckModal
          complexity={meetingCheck.complexity!}
          consideredMeeting={meetingCheck.consideredMeeting}
          onConfirm={handleConfirmDecision}
          onBypass={submitRequest}
        />
      )}
    </div>
  );
}

function MeetingCheckModal({
  complexity,
  consideredMeeting,
  onConfirm,
  onBypass,
}: {
  complexity: 'simple' | 'moderate' | 'complex';
  consideredMeeting: boolean | null;
  onConfirm: (value: boolean) => void;
  onBypass: () => void;
}) {
  const cost = calculateMeetingCost(complexity, 3);
  const message = getMeetingComparisonMessage(cost);

  if (consideredMeeting === true) {
    // Show the cost comparison
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            maxWidth: 500,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ marginBottom: 16, fontSize: 18 }}>Meeting vs. Async</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: 'var(--color-error-50)',
                border: '1px solid var(--color-error-100)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-error-600)', fontWeight: 500, marginBottom: 8 }}>
                Sync Meeting Cost
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-error-700)', marginBottom: 4 }}>
                {formatMeetingCost(cost)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-error-600)', lineHeight: '140%' }}>
                {cost.meetingMinutes}m meeting
                <br />+{cost.prepTimePerAttendee}m prep/person
                <br />+{cost.contextSwitchCost}m context switch
                <br />
                × {cost.attendeeCount} people
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-success-50)',
                border: '1px solid var(--color-success-100)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-success-600)', fontWeight: 500, marginBottom: 8 }}>
                Async Cost
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-success-700)', marginBottom: 4 }}>
                1 Token
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-success-600)', lineHeight: '140%' }}>
                Your time to write
                <br />+{cost.asyncAlternativeMinutes}m
                <br />
                <br />
                No context switching
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-100)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              fontSize: 13,
              color: 'var(--color-primary-700)',
              marginBottom: 20,
              lineHeight: '150%',
            }}
          >
            {message}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => onBypass()}
              style={{
                padding: '10px 20px',
                background: 'var(--color-primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Send Async Request (Go Ahead)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initial question: could you do a meeting instead?
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          maxWidth: 500,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ marginBottom: 12, fontSize: 18 }}>Before you send this...</h2>

        <p style={{ fontSize: 14, color: 'var(--color-neutral-600)', marginBottom: 24, lineHeight: '160%' }}>
          Could you solve this with a synchronous meeting instead? If yes, let's think through why async is still better.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onConfirm(false)}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'white',
              border: '2px solid var(--color-primary-600)',
              color: 'var(--color-primary-600)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            No, async is the right call
          </button>
          <button
            onClick={() => onConfirm(true)}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'var(--color-warning-50)',
              border: '2px solid var(--color-warning-500)',
              color: 'var(--color-warning-600)',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Yes, a meeting would work
          </button>
        </div>
      </div>
    </div>
  );
}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

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
