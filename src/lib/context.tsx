import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, ExpertiseArea, DecisionRequest, RequestResponse } from '../types';
import {
  fetchAllProfiles,
  fetchAllExpertiseAreas,
  fetchRequestsForRequester,
  fetchRequestsForReviewer,
  fetchResponsesForRequest,
  insertRequest,
  insertResponse,
  insertTransaction,
  updateRequestStatus,
  insertExpertiseArea,
  deleteExpertiseArea,
  updateProfileRole,
  upsertProfile,
} from './db';
import type { DecisionType, RequesterType, ResponseType, UserRole } from '../types';

interface AppState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profiles: Profile[];
  expertiseAreas: ExpertiseArea[];
  myRequests: DecisionRequest[];
  reviewRequests: DecisionRequest[];
  loading: boolean;
}

interface AppActions {
  refreshAll: () => Promise<void>;
  createRequest: (req: {
    reviewer_id: string;
    expertise_area_id: string;
    title: string;
    decision_type: DecisionType;
    requester_type: RequesterType;
    context: string;
    alternatives_considered: string;
    deadline: string;
    notion_link?: string;
  }) => Promise<DecisionRequest>;
  respondToRequest: (requestId: string, reviewerId: string, responseType: ResponseType, comment: string) => Promise<void>;
  addExpertiseArea: (area: { name: string; description: string; weekly_capacity: number }) => Promise<ExpertiseArea>;
  removeExpertiseArea: (id: string) => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  getResponsesForRequest: (requestId: string) => Promise<RequestResponse[]>;
  getProfile: (id: string) => Profile | undefined;
  getExpertiseArea: (id: string) => ExpertiseArea | undefined;
  getReviewers: () => Profile[];
  getExpertiseForReviewer: (reviewerId: string) => ExpertiseArea[];
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([]);
  const [myRequests, setMyRequests] = useState<DecisionRequest[]>([]);
  const [reviewRequests, setReviewRequests] = useState<DecisionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (uid: string) => {
    const [allProfiles, allAreas, myReqs, revReqs] = await Promise.all([
      fetchAllProfiles(),
      fetchAllExpertiseAreas(),
      fetchRequestsForRequester(uid),
      fetchRequestsForReviewer(uid),
    ]);
    setProfiles(allProfiles);
    setExpertiseAreas(allAreas);
    setMyRequests(myReqs);
    setReviewRequests(revReqs);
    const p = allProfiles.find((pr) => pr.id === uid) || null;
    setProfile(p);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadData(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        (async () => {
          setLoading(true);
          await loadData(s.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setProfiles([]);
        setExpertiseAreas([]);
        setMyRequests([]);
        setReviewRequests([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadData]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    await loadData(user.id);
  }, [user, loadData]);

  const createRequest = useCallback(async (req: {
    reviewer_id: string;
    expertise_area_id: string;
    title: string;
    decision_type: DecisionType;
    requester_type: RequesterType;
    context: string;
    alternatives_considered: string;
    deadline: string;
    notion_link?: string;
  }): Promise<DecisionRequest> => {
    if (!user || !profile) throw new Error('Not authenticated');
    const newReq = await insertRequest({ ...req, requester_id: user.id });
    await insertTransaction({
      from_user_id: user.id,
      to_user_id: req.reviewer_id,
      request_id: newReq.id,
      amount: 1,
      transaction_type: 'spend',
    });
    // Decrement token balance
    await upsertProfile({
      id: user.id,
      token_balance: Math.max(0, profile.token_balance - 1),
      tokens_used_this_week: profile.tokens_used_this_week + 1,
    });
    await refreshAll();
    return newReq;
  }, [user, profile, refreshAll]);

  const respondToRequest = useCallback(async (
    requestId: string, reviewerId: string, responseType: ResponseType, comment: string
  ) => {
    const statusMap: Record<ResponseType, DecisionRequest['status']> = {
      approved: 'approved',
      rejected: 'rejected',
      needs_info: 'needs_info',
      feedback: 'in_review',
    };
    await insertResponse({ request_id: requestId, reviewer_id: reviewerId, response_type: responseType, comment });
    await updateRequestStatus(requestId, statusMap[responseType], new Date().toISOString());
    await refreshAll();
  }, [refreshAll]);

  const addExpertiseArea = useCallback(async (area: { name: string; description: string; weekly_capacity: number }) => {
    if (!user) throw new Error('Not authenticated');
    const newArea = await insertExpertiseArea({ ...area, reviewer_id: user.id });
    await refreshAll();
    return newArea;
  }, [user, refreshAll]);

  const removeExpertiseArea = useCallback(async (id: string) => {
    await deleteExpertiseArea(id);
    await refreshAll();
  }, [refreshAll]);

  const updateRole = useCallback(async (role: UserRole) => {
    if (!user) throw new Error('Not authenticated');
    await updateProfileRole(user.id, role);
    await refreshAll();
  }, [user, refreshAll]);

  const getResponsesForRequest = useCallback((requestId: string) => {
    return fetchResponsesForRequest(requestId);
  }, []);

  const getProfile = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles]);
  const getExpertiseArea = useCallback((id: string) => expertiseAreas.find((e) => e.id === id), [expertiseAreas]);
  const getReviewers = useCallback(() => profiles.filter((p) => p.role === 'reviewer' || p.role === 'both'), [profiles]);
  const getExpertiseForReviewer = useCallback((reviewerId: string) => expertiseAreas.filter((e) => e.reviewer_id === reviewerId), [expertiseAreas]);

  const value: AppContextType = {
    session, user, profile, profiles, expertiseAreas, myRequests, reviewRequests, loading,
    refreshAll, createRequest, respondToRequest, addExpertiseArea, removeExpertiseArea, updateRole,
    getResponsesForRequest, getProfile, getExpertiseArea, getReviewers, getExpertiseForReviewer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
