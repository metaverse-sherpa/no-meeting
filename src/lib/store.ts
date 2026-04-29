import type { Profile, ExpertiseArea, DecisionRequest, RequestResponse, TokenTransaction } from '../types';

const CURRENT_USER_ID = 'user-1';

const initialProfiles: Profile[] = [
  {
    id: 'user-1',
    full_name: 'Alex Chen',
    role: 'requester',
    title: 'Product Manager',
    token_balance: 10,
    tokens_used_this_week: 3,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    full_name: 'Sarah Kim',
    role: 'reviewer',
    title: 'Tech Architect',
    token_balance: 0,
    tokens_used_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'user-3',
    full_name: 'Marcus Rivera',
    role: 'reviewer',
    title: 'Design Lead',
    token_balance: 0,
    tokens_used_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-12T10:00:00Z',
  },
  {
    id: 'user-4',
    full_name: 'Priya Sharma',
    role: 'both',
    title: 'Senior Developer',
    token_balance: 8,
    tokens_used_this_week: 2,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-08T10:00:00Z',
  },
  {
    id: 'user-5',
    full_name: 'Jordan Lee',
    role: 'reviewer',
    title: 'VP of Product',
    token_balance: 0,
    tokens_used_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-05T10:00:00Z',
  },
];

const initialExpertiseAreas: ExpertiseArea[] = [
  {
    id: 'exp-1',
    reviewer_id: 'user-2',
    name: 'Backend Architecture',
    description: 'System design, API patterns, database schema decisions',
    weekly_capacity: 3,
    tokens_received_this_week: 1,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'exp-2',
    reviewer_id: 'user-2',
    name: 'Infrastructure & DevOps',
    description: 'Cloud architecture, CI/CD, deployment strategies',
    weekly_capacity: 2,
    tokens_received_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'exp-3',
    reviewer_id: 'user-3',
    name: 'Design Systems',
    description: 'Component libraries, design tokens, visual consistency',
    weekly_capacity: 4,
    tokens_received_this_week: 2,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-12T10:00:00Z',
  },
  {
    id: 'exp-4',
    reviewer_id: 'user-3',
    name: 'UX Strategy',
    description: 'User research, interaction patterns, accessibility',
    weekly_capacity: 2,
    tokens_received_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-12T10:00:00Z',
  },
  {
    id: 'exp-5',
    reviewer_id: 'user-5',
    name: 'Product Strategy',
    description: 'Roadmap decisions, prioritization, market fit',
    weekly_capacity: 2,
    tokens_received_this_week: 1,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'exp-6',
    reviewer_id: 'user-5',
    name: 'Go-to-Market',
    description: 'Launch plans, pricing, positioning',
    weekly_capacity: 1,
    tokens_received_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'exp-7',
    reviewer_id: 'user-4',
    name: 'Frontend Architecture',
    description: 'React patterns, state management, performance',
    weekly_capacity: 3,
    tokens_received_this_week: 1,
    week_reset_at: new Date().toISOString(),
    created_at: '2025-01-08T10:00:00Z',
  },
];

const initialRequests: DecisionRequest[] = [
  {
    id: 'req-1',
    requester_id: 'user-1',
    reviewer_id: 'user-2',
    expertise_area_id: 'exp-1',
    title: 'Migrate payment service to event-driven architecture',
    decision_type: 'sign_off',
    requester_type: 'pm',
    context: 'We need to decouple the payment processing from the main order flow. The current synchronous approach causes cascading failures when the payment service is slow. I propose moving to an event-driven model using our existing message broker.',
    alternatives_considered: '1. Keep synchronous but add circuit breakers (doesn\'t solve root cause)\n2. Move to a separate microservice (too much overhead for current scale)',
    deadline: '2025-02-01',
    status: 'pending',
    tokens_spent: 1,
    created_at: '2025-01-20T09:00:00Z',
  },
  {
    id: 'req-2',
    requester_id: 'user-4',
    reviewer_id: 'user-3',
    expertise_area_id: 'exp-3',
    title: 'Adopt Radix UI as base for component library',
    decision_type: 'approval',
    requester_type: 'developer',
    context: 'Our current component library has accessibility gaps and inconsistent behavior. Radix UI provides unstyled, accessible primitives that we can theme consistently. This would reduce our accessibility debt and speed up component development.',
    alternatives_considered: '1. Build from scratch (6+ months, we don\'t have capacity)\n2. Use Headless UI (fewer components, less flexible)',
    deadline: '2025-01-28',
    status: 'in_review',
    tokens_spent: 1,
    created_at: '2025-01-18T14:00:00Z',
  },
  {
    id: 'req-3',
    requester_id: 'user-1',
    reviewer_id: 'user-5',
    expertise_area_id: 'exp-5',
    title: 'Prioritize mobile app over web dashboard redesign',
    decision_type: 'approval',
    requester_type: 'pm',
    context: 'Our mobile users now represent 60% of active sessions but the mobile experience is significantly worse than web. I believe we should prioritize the mobile app rebuild for Q2 instead of the dashboard redesign.',
    alternatives_considered: '1. Split team 50/50 (neither ships well)\n2. Dashboard first (lower user impact)',
    deadline: '2025-01-25',
    status: 'approved',
    tokens_spent: 1,
    responded_at: '2025-01-19T16:00:00Z',
    created_at: '2025-01-17T11:00:00Z',
  },
  {
    id: 'req-4',
    requester_id: 'user-4',
    reviewer_id: 'user-2',
    expertise_area_id: 'exp-1',
    title: 'Use WebSocket for real-time collaboration features',
    decision_type: 'feedback',
    requester_type: 'developer',
    context: 'We need real-time collaboration for the document editing feature. I\'m proposing WebSocket connections with CRDT for conflict resolution. Want to validate this approach before building.',
    alternatives_considered: '1. Server-sent events (unidirectional, won\'t work for collaboration)\n2. Polling (too slow, too much load)',
    deadline: '2025-02-05',
    status: 'pending',
    tokens_spent: 1,
    created_at: '2025-01-21T10:00:00Z',
  },
  {
    id: 'req-5',
    requester_id: 'user-1',
    reviewer_id: 'user-3',
    expertise_area_id: 'exp-4',
    title: 'Simplify onboarding flow from 7 steps to 3',
    decision_type: 'sign_off',
    requester_type: 'pm',
    context: 'Our onboarding completion rate is 23%. Research shows users drop off at step 4. I propose collapsing to: 1) Account creation, 2) Profile setup, 3) First action. This removes the team invite and integration setup steps (move them to post-onboarding).',
    alternatives_considered: '1. Keep 7 steps but add progress indicators (doesn\'t address root cause)\n2. Progressive disclosure within fewer screens (similar approach, more complex)',
    deadline: '2025-01-30',
    status: 'needs_info',
    tokens_spent: 1,
    responded_at: '2025-01-22T09:00:00Z',
    created_at: '2025-01-19T15:00:00Z',
  },
];

const initialResponses: RequestResponse[] = [
  {
    id: 'resp-1',
    request_id: 'req-3',
    reviewer_id: 'user-5',
    response_type: 'approved',
    comment: 'Strong case. Mobile is clearly where our users are. Let\'s make sure we communicate this shift clearly to the dashboard team - they should know this is a priority call, not a quality judgment on their work.',
    created_at: '2025-01-19T16:00:00Z',
  },
  {
    id: 'resp-2',
    request_id: 'req-5',
    reviewer_id: 'user-3',
    response_type: 'needs_info',
    comment: 'I like the direction but need to understand: what happens to the team invite flow? If we move it post-onboarding, do users still discover it? Can you share the drop-off data broken down by step? Also want to see the proposed 3-step wireframes before signing off.',
    created_at: '2025-01-22T09:00:00Z',
  },
];

const initialTransactions: TokenTransaction[] = [
  { id: 'txn-1', from_user_id: 'user-1', to_user_id: 'user-2', request_id: 'req-1', amount: 1, transaction_type: 'spend', created_at: '2025-01-20T09:00:00Z' },
  { id: 'txn-2', from_user_id: 'user-4', to_user_id: 'user-3', request_id: 'req-2', amount: 1, transaction_type: 'spend', created_at: '2025-01-18T14:00:00Z' },
  { id: 'txn-3', from_user_id: 'user-1', to_user_id: 'user-5', request_id: 'req-3', amount: 1, transaction_type: 'spend', created_at: '2025-01-17T11:00:00Z' },
  { id: 'txn-4', from_user_id: 'user-4', to_user_id: 'user-2', request_id: 'req-4', amount: 1, transaction_type: 'spend', created_at: '2025-01-21T10:00:00Z' },
  { id: 'txn-5', from_user_id: 'user-1', to_user_id: 'user-3', request_id: 'req-5', amount: 1, transaction_type: 'spend', created_at: '2025-01-19T15:00:00Z' },
];

export interface StoreState {
  currentUserId: string;
  profiles: Profile[];
  expertiseAreas: ExpertiseArea[];
  requests: DecisionRequest[];
  responses: RequestResponse[];
  transactions: TokenTransaction[];
}

function loadState(): StoreState {
  try {
    const saved = localStorage.getItem('tokenflow-state');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    currentUserId: CURRENT_USER_ID,
    profiles: initialProfiles,
    expertiseAreas: initialExpertiseAreas,
    requests: initialRequests,
    responses: initialResponses,
    transactions: initialTransactions,
  };
}

function saveState(state: StoreState) {
  localStorage.setItem('tokenflow-state', JSON.stringify(state));
}

let state = loadState();

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getState(): StoreState {
  return state;
}

function updateState(partial: Partial<StoreState>) {
  state = { ...state, ...partial };
  saveState(state);
  listeners.forEach((l) => l());
}

export function getCurrentUser(): Profile {
  return state.profiles.find((p) => p.id === state.currentUserId)!;
}

export function getReviewers(): Profile[] {
  return state.profiles.filter((p) => p.role === 'reviewer' || p.role === 'both');
}

export function getExpertiseForReviewer(reviewerId: string): ExpertiseArea[] {
  return state.expertiseAreas.filter((e) => e.reviewer_id === reviewerId);
}

export function getRequestsForRequester(requesterId: string): DecisionRequest[] {
  return state.requests.filter((r) => r.requester_id === requesterId);
}

export function getRequestsForReviewer(reviewerId: string): DecisionRequest[] {
  return state.requests.filter((r) => r.reviewer_id === reviewerId);
}

export function getResponsesForRequest(requestId: string): RequestResponse[] {
  return state.responses.filter((r) => r.request_id === requestId);
}

export function getProfile(id: string): Profile | undefined {
  return state.profiles.find((p) => p.id === id);
}

export function getExpertiseArea(id: string): ExpertiseArea | undefined {
  return state.expertiseAreas.find((e) => e.id === id);
}

export function createRequest(request: Omit<DecisionRequest, 'id' | 'status' | 'tokens_spent' | 'responded_at' | 'created_at'>) {
  const newRequest: DecisionRequest = {
    ...request,
    id: `req-${Date.now()}`,
    status: 'pending',
    tokens_spent: 1,
    created_at: new Date().toISOString(),
  };

  const transaction: TokenTransaction = {
    id: `txn-${Date.now()}`,
    from_user_id: request.requester_id,
    to_user_id: request.reviewer_id,
    request_id: newRequest.id,
    amount: 1,
    transaction_type: 'spend',
    created_at: new Date().toISOString(),
  };

  const updatedProfiles = state.profiles.map((p) => {
    if (p.id === request.requester_id) {
      return { ...p, token_balance: p.token_balance - 1, tokens_used_this_week: p.tokens_used_this_week + 1 };
    }
    return p;
  });

  const updatedExpertise = state.expertiseAreas.map((e) => {
    if (e.id === request.expertise_area_id) {
      return { ...e, tokens_received_this_week: e.tokens_received_this_week + 1 };
    }
    return e;
  });

  updateState({
    requests: [...state.requests, newRequest],
    transactions: [...state.transactions, transaction],
    profiles: updatedProfiles,
    expertiseAreas: updatedExpertise,
  });

  return newRequest;
}

export function respondToRequest(requestId: string, responseType: RequestResponse['response_type'], comment: string) {
  const request = state.requests.find((r) => r.id === requestId);
  if (!request) return;

  const newResponse: RequestResponse = {
    id: `resp-${Date.now()}`,
    request_id: requestId,
    reviewer_id: request.reviewer_id,
    response_type: responseType,
    comment,
    created_at: new Date().toISOString(),
  };

  const statusMap: Record<string, DecisionRequest['status']> = {
    approved: 'approved',
    rejected: 'rejected',
    needs_info: 'needs_info',
    feedback: 'in_review',
  };

  const updatedRequests = state.requests.map((r) => {
    if (r.id === requestId) {
      return { ...r, status: statusMap[responseType] || r.status, responded_at: new Date().toISOString() };
    }
    return r;
  });

  updateState({
    requests: updatedRequests,
    responses: [...state.responses, newResponse],
  });

  return newResponse;
}

export function addExpertiseArea(area: Omit<ExpertiseArea, 'id' | 'tokens_received_this_week' | 'week_reset_at' | 'created_at'>) {
  const newArea: ExpertiseArea = {
    ...area,
    id: `exp-${Date.now()}`,
    tokens_received_this_week: 0,
    week_reset_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  updateState({ expertiseAreas: [...state.expertiseAreas, newArea] });
  return newArea;
}

export function removeExpertiseArea(id: string) {
  updateState({ expertiseAreas: state.expertiseAreas.filter((e) => e.id !== id) });
}

export function updateProfile(id: string, updates: Partial<Profile>) {
  const updatedProfiles = state.profiles.map((p) => {
    if (p.id === id) return { ...p, ...updates };
    return p;
  });
  updateState({ profiles: updatedProfiles });
}

export function switchUser(userId: string) {
  updateState({ currentUserId: userId });
}

export function resetData() {
  localStorage.removeItem('tokenflow-state');
  state = {
    currentUserId: CURRENT_USER_ID,
    profiles: initialProfiles,
    expertiseAreas: initialExpertiseAreas,
    requests: initialRequests,
    responses: initialResponses,
    transactions: initialTransactions,
  };
  listeners.forEach((l) => l());
}

export function useStore(): StoreState {
  return state;
}
