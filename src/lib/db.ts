import { supabase } from './supabase';
import type {
  Profile, ExpertiseArea, DecisionRequest, RequestResponse,
  TokenTransaction, UserRole, DecisionType, RequesterType, ResponseType,
} from '../types';

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at');
  if (error) throw error;
  return data as Profile[];
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  return data as Profile | null;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(profile);
  if (error) throw error;
}

export async function updateProfileRole(id: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

// ── Expertise Areas ────────────────────────────────────────────────────────────

export async function fetchAllExpertiseAreas(): Promise<ExpertiseArea[]> {
  const { data, error } = await supabase.from('expertise_areas').select('*').order('created_at');
  if (error) throw error;
  return data as ExpertiseArea[];
}

export async function insertExpertiseArea(
  area: { reviewer_id: string; name: string; description: string; weekly_capacity: number }
): Promise<ExpertiseArea> {
  const { data, error } = await supabase.from('expertise_areas').insert(area).select().single();
  if (error) throw error;
  return data as ExpertiseArea;
}

export async function deleteExpertiseArea(id: string): Promise<void> {
  const { error } = await supabase.from('expertise_areas').delete().eq('id', id);
  if (error) throw error;
}

// ── Decision Requests ──────────────────────────────────────────────────────────

export async function fetchRequestsForRequester(requesterId: string): Promise<DecisionRequest[]> {
  const { data, error } = await supabase
    .from('decision_requests')
    .select('*')
    .eq('requester_id', requesterId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DecisionRequest[];
}

export async function fetchRequestsForReviewer(reviewerId: string): Promise<DecisionRequest[]> {
  const { data, error } = await supabase
    .from('decision_requests')
    .select('*')
    .eq('reviewer_id', reviewerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DecisionRequest[];
}

export async function fetchRequest(id: string): Promise<DecisionRequest | null> {
  const { data } = await supabase.from('decision_requests').select('*').eq('id', id).maybeSingle();
  return data as DecisionRequest | null;
}

export async function insertRequest(req: {
  requester_id: string;
  reviewer_id: string;
  expertise_area_id: string;
  title: string;
  decision_type: DecisionType;
  requester_type: RequesterType;
  context: string;
  alternatives_considered: string;
  deadline: string;
  notion_link?: string;
}): Promise<DecisionRequest> {
  const { data, error } = await supabase
    .from('decision_requests')
    .insert({ ...req, status: 'pending', tokens_spent: 1 })
    .select()
    .single();
  if (error) throw error;
  return data as DecisionRequest;
}

export async function updateRequestStatus(
  id: string,
  status: DecisionRequest['status'],
  respondedAt?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (respondedAt) update.responded_at = respondedAt;
  const { error } = await supabase.from('decision_requests').update(update).eq('id', id);
  if (error) throw error;
}

// ── Request Responses ──────────────────────────────────────────────────────────

export async function fetchResponsesForRequest(requestId: string): Promise<RequestResponse[]> {
  const { data, error } = await supabase
    .from('request_responses')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at');
  if (error) throw error;
  return data as RequestResponse[];
}

export async function insertResponse(resp: {
  request_id: string;
  reviewer_id: string;
  response_type: ResponseType;
  comment: string;
}): Promise<RequestResponse> {
  const { data, error } = await supabase.from('request_responses').insert(resp).select().single();
  if (error) throw error;
  return data as RequestResponse;
}

// ── Token Transactions ─────────────────────────────────────────────────────────

export async function insertTransaction(txn: {
  from_user_id: string;
  to_user_id: string;
  request_id: string;
  amount: number;
  transaction_type: 'spend' | 'refund';
}): Promise<TokenTransaction> {
  const { data, error } = await supabase.from('token_transactions').insert(txn).select().single();
  if (error) throw error;
  return data as TokenTransaction;
}

export async function fetchTransactionsForUser(userId: string): Promise<TokenTransaction[]> {
  const { data, error } = await supabase
    .from('token_transactions')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as TokenTransaction[];
}

// ── Notion extraction via edge function ───────────────────────────────────────

export async function extractNotionViaEdge(url: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || supabaseAnonKey;

  const res = await fetch(`${supabaseUrl}/functions/v1/notion-extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Extraction failed');
  return res.json();
}
