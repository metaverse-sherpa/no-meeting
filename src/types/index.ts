export type UserRole = 'requester' | 'reviewer' | 'both';
export type RequesterType = 'pm' | 'developer';
export type DecisionType = 'approval' | 'sign_off' | 'feedback' | 'blocking_concern';
export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_info' | 'withdrawn';
export type ResponseType = 'approved' | 'rejected' | 'needs_info' | 'feedback';
export type TransactionType = 'spend' | 'refund';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  title: string;
  avatar_url?: string;
  token_balance: number;
  tokens_used_this_week: number;
  week_reset_at: string;
  created_at: string;
}

export interface ExpertiseArea {
  id: string;
  reviewer_id: string;
  name: string;
  description: string;
  weekly_capacity: number;
  tokens_received_this_week: number;
  week_reset_at: string;
  created_at: string;
}

export interface DecisionRequest {
  id: string;
  requester_id: string;
  reviewer_id: string;
  expertise_area_id: string;
  title: string;
  decision_type: DecisionType;
  requester_type: RequesterType;
  context: string;
  alternatives_considered: string;
  deadline: string;
  status: RequestStatus;
  tokens_spent: number;
  responded_at?: string;
  created_at: string;
}

export interface RequestResponse {
  id: string;
  request_id: string;
  reviewer_id: string;
  response_type: ResponseType;
  comment: string;
  created_at: string;
}

export interface TokenTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  request_id: string;
  amount: number;
  transaction_type: TransactionType;
  created_at: string;
}
