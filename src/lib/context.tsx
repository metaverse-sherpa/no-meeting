import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

const CURRENT_USER_KEY = 'tokenflow-current-user';

interface AppState {
  currentUserId: string | null;
  profile: Profile | null;
  profiles: Profile[];
  expertiseAreas: ExpertiseArea[];
  myRequests: DecisionRequest[];
  reviewRequests: DecisionRequest[];
  loading: boolean;
}

interface AppActions {
  switchUser: (id: string) => void;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => localStorage.getItem(CURRENT_USER_KEY)
  );
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
    setProfile(allProfiles.find((p) => p.id === uid) ?? null);
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      // Just load profiles so the login screen can show them
      fetchAllProfiles().then((p) => {
        setProfiles(p);
        setLoading(false);
      });
      return;
    }
    setLoading(true);
    loadData(currentUserId).finally(() => setLoading(false));
  }, [currentUserId, loadData]);

  const switchUser = useCallback((id: string) => {
    localStorage.setItem(CURRENT_USER_KEY, id);
    setCurrentUserId(id);
  }, []);

  const refreshAll = useCallback(async () => {
    if (!currentUserId) return;
    await loadData(currentUserId);
  }, [currentUserId, loadData]);

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
    if (!currentUserId || !profile) throw new Error('No user selected');
    const newReq = await insertRequest({ ...req, requester_id: currentUserId });
    await insertTransaction({
      from_user_id: currentUserId,
      to_user_id: req.reviewer_id,
      request_id: newReq.id,
      amount: 1,
      transaction_type: 'spend',
    });
    await upsertProfile({
      id: currentUserId,
      token_balance: Math.max(0, profile.token_balance - 1),
      tokens_used_this_week: profile.tokens_used_this_week + 1,
    });
    await refreshAll();
    return newReq;
  }, [currentUserId, profile, refreshAll]);

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
    if (!currentUserId) throw new Error('No user selected');
    const newArea = await insertExpertiseArea({ ...area, reviewer_id: currentUserId });
    await refreshAll();
    return newArea;
  }, [currentUserId, refreshAll]);

  const removeExpertiseArea = useCallback(async (id: string) => {
    await deleteExpertiseArea(id);
    await refreshAll();
  }, [refreshAll]);

  const updateRole = useCallback(async (role: UserRole) => {
    if (!currentUserId) throw new Error('No user selected');
    await updateProfileRole(currentUserId, role);
    await refreshAll();
  }, [currentUserId, refreshAll]);

  const getResponsesForRequest = useCallback((requestId: string) => {
    return fetchResponsesForRequest(requestId);
  }, []);

  const getProfile = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles]);
  const getExpertiseArea = useCallback((id: string) => expertiseAreas.find((e) => e.id === id), [expertiseAreas]);
  const getReviewers = useCallback(() => profiles.filter((p) => p.role === 'reviewer' || p.role === 'both'), [profiles]);
  const getExpertiseForReviewer = useCallback((reviewerId: string) => expertiseAreas.filter((e) => e.reviewer_id === reviewerId), [expertiseAreas]);

  const value: AppContextType = {
    currentUserId, profile, profiles, expertiseAreas, myRequests, reviewRequests, loading,
    switchUser, refreshAll, createRequest, respondToRequest, addExpertiseArea, removeExpertiseArea, updateRole,
    getResponsesForRequest, getProfile, getExpertiseArea, getReviewers, getExpertiseForReviewer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
