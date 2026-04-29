import type { RequestStatus, DecisionType, ResponseType } from '../types';

const statusConfig: Record<RequestStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pending', bg: 'var(--color-warning-50)', color: 'var(--color-warning-600)' },
  in_review: { label: 'In Review', bg: 'var(--color-primary-50)', color: 'var(--color-primary-700)' },
  approved: { label: 'Approved', bg: 'var(--color-success-50)', color: 'var(--color-success-700)' },
  rejected: { label: 'Rejected', bg: 'var(--color-error-50)', color: 'var(--color-error-600)' },
  needs_info: { label: 'Needs Info', bg: 'var(--color-warning-50)', color: 'var(--color-warning-600)' },
  withdrawn: { label: 'Withdrawn', bg: 'var(--color-neutral-100)', color: 'var(--color-neutral-500)' },
};

const decisionTypeConfig: Record<DecisionType, { label: string; bg: string; color: string }> = {
  approval: { label: 'Approval', bg: 'var(--color-primary-50)', color: 'var(--color-primary-700)' },
  sign_off: { label: 'Sign-off', bg: 'var(--color-accent-50)', color: 'var(--color-accent-600)' },
  feedback: { label: 'Feedback', bg: 'var(--color-warning-50)', color: 'var(--color-warning-600)' },
  blocking_concern: { label: 'Blocking Concern', bg: 'var(--color-error-50)', color: 'var(--color-error-600)' },
};

const responseTypeConfig: Record<ResponseType, { label: string; bg: string; color: string }> = {
  approved: { label: 'Approved', bg: 'var(--color-success-50)', color: 'var(--color-success-700)' },
  rejected: { label: 'Rejected', bg: 'var(--color-error-50)', color: 'var(--color-error-600)' },
  needs_info: { label: 'Needs Info', bg: 'var(--color-warning-50)', color: 'var(--color-warning-600)' },
  feedback: { label: 'Feedback', bg: 'var(--color-primary-50)', color: 'var(--color-primary-700)' },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

export function DecisionTypeBadge({ type }: { type: DecisionType }) {
  const config = decisionTypeConfig[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

export function ResponseTypeBadge({ type }: { type: ResponseType }) {
  const config = responseTypeConfig[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
