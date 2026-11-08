import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { DONATION_INTERVAL_MONTHS } from '@/constants/bloodGroups';
import { badges } from '@/data/badges';
import { seedDonations } from '@/data/donations';
import { createSeedNotifications } from '@/data/notifications';
import { createSeedRequests, PAST_ACCEPTED_REQUESTS } from '@/data/requests';
import { defaultSettings, demoUser } from '@/data/user';
import { clearSnapshot, loadSnapshot, saveSnapshot } from '@/services/storage';
import type {
  AppNotification,
  AppSettings,
  Availability,
  BloodRequest,
  ChatMessage,
  Donation,
  UserProfile,
} from '@/types';
import { addMonths, parseDate, toISODate } from '@/utils/date';

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export interface AppState {
  hydrated: boolean;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  user: UserProfile;
  settings: AppSettings;
  requests: BloodRequest[];
  notifications: AppNotification[];
  donations: Donation[];
  /** Requests the user has responded to in this app */
  respondedRequestIds: string[];
  chat: ChatMessage[];
}

type PersistedState = Omit<AppState, 'hydrated'>;

const createInitialState = (): AppState => ({
  hydrated: false,
  hasOnboarded: false,
  isAuthenticated: false,
  user: demoUser,
  settings: defaultSettings,
  requests: createSeedRequests(),
  notifications: createSeedNotifications(),
  donations: seedDonations,
  respondedRequestIds: [],
  chat: [],
});

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type NewRequestInput = Omit<
  BloodRequest,
  'id' | 'createdAt' | 'respondedCount' | 'status' | 'distanceKm' | 'isMine'
>;

type Action =
  | { type: 'HYDRATE'; payload: Partial<PersistedState> | null }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<UserProfile> }
  | { type: 'SET_AVAILABILITY'; payload: Availability }
  | { type: 'ADD_REQUEST'; payload: BloodRequest }
  | { type: 'RESPOND_REQUEST'; id: string }
  | { type: 'WITHDRAW_RESPONSE'; id: string }
  | { type: 'MARK_FULFILLED'; id: string }
  | { type: 'DELETE_REQUEST'; id: string }
  | { type: 'ADD_DONATION'; payload: Donation }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE_NOTIFICATION'; id: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_CHAT'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'RESET_DEMO' };

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...(action.payload ?? {}), hydrated: true };
    case 'COMPLETE_ONBOARDING':
      return { ...state, hasOnboarded: true };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, hasOnboarded: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, chat: [] };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_AVAILABILITY':
      return { ...state, user: { ...state.user, availability: action.payload } };
    case 'ADD_REQUEST':
      return { ...state, requests: [action.payload, ...state.requests] };
    case 'RESPOND_REQUEST':
      if (state.respondedRequestIds.includes(action.id)) return state;
      return {
        ...state,
        respondedRequestIds: [...state.respondedRequestIds, action.id],
        requests: state.requests.map((r) =>
          r.id === action.id ? { ...r, respondedCount: r.respondedCount + 1 } : r,
        ),
      };
    case 'WITHDRAW_RESPONSE':
      return {
        ...state,
        respondedRequestIds: state.respondedRequestIds.filter((id) => id !== action.id),
        requests: state.requests.map((r) =>
          r.id === action.id ? { ...r, respondedCount: Math.max(0, r.respondedCount - 1) } : r,
        ),
      };
    case 'MARK_FULFILLED':
      return {
        ...state,
        requests: state.requests.map((r) => (r.id === action.id ? { ...r, status: 'fulfilled' } : r)),
      };
    case 'DELETE_REQUEST':
      return { ...state, requests: state.requests.filter((r) => r.id !== action.id) };
    case 'ADD_DONATION':
      return {
        ...state,
        donations: [action.payload, ...state.donations],
        user: {
          ...state.user,
          livesSaved: state.user.livesSaved + action.payload.units * 3,
          availability: 'resting',
        },
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'DELETE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.id) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_CHAT':
      return { ...state, chat: [...state.chat, action.payload] };
    case 'CLEAR_CHAT':
      return { ...state, chat: [] };
    case 'RESET_DEMO':
      return { ...createInitialState(), hydrated: true, hasOnboarded: true, isAuthenticated: true };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface AppActions {
  completeOnboarding: () => void;
  login: () => void;
  logout: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  setAvailability: (value: Availability) => void;
  createRequest: (input: NewRequestInput) => BloodRequest;
  respondToRequest: (id: string) => void;
  withdrawResponse: (id: string) => void;
  markRequestFulfilled: (id: string) => void;
  deleteRequest: (id: string) => void;
  recordDonation: (input: { hospitalName: string; city: Donation['city']; units: number; requestId?: string }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addChatMessage: (role: ChatMessage['role'], text: string) => void;
  clearChat: () => void;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<{ state: AppState; actions: AppActions } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const skipNextSave = useRef(true);

  // Hydrate from AsyncStorage once.
  useEffect(() => {
    let alive = true;
    loadSnapshot<PersistedState>().then((snapshot) => {
      if (alive) dispatch({ type: 'HYDRATE', payload: snapshot });
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist after every change once hydrated.
  useEffect(() => {
    if (!state.hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const { hydrated: _ignored, ...persisted } = state;
    const t = setTimeout(() => saveSnapshot(persisted), 250);
    return () => clearTimeout(t);
  }, [state]);

  const actions = useMemo<AppActions>(
    () => ({
      completeOnboarding: () => dispatch({ type: 'COMPLETE_ONBOARDING' }),
      login: () => dispatch({ type: 'LOGIN' }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      updateUser: (payload) => dispatch({ type: 'UPDATE_USER', payload }),
      setAvailability: (payload) => dispatch({ type: 'SET_AVAILABILITY', payload }),
      createRequest: (input) => {
        const request: BloodRequest = {
          ...input,
          id: uid('r'),
          createdAt: new Date().toISOString(),
          respondedCount: 0,
          status: 'active',
          distanceKm: 0.5,
          isMine: true,
        };
        dispatch({ type: 'ADD_REQUEST', payload: request });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: uid('n'),
            type: 'system',
            title: 'Blood Request Posted',
            body: `Your request for ${request.units} unit${request.units > 1 ? 's' : ''} of ${request.bloodGroup} at ${request.hospitalName} is now live. Nearby donors will be notified.`,
            createdAt: new Date().toISOString(),
            read: false,
            link: `/requests/${request.id}`,
          },
        });
        return request;
      },
      respondToRequest: (id) => {
        dispatch({ type: 'RESPOND_REQUEST', id });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: uid('n'),
            type: 'accepted',
            title: 'You Accepted a Request',
            body: 'You have accepted this request. Please proceed to the hospital and show this notification at the blood bank.',
            createdAt: new Date().toISOString(),
            read: false,
            link: `/requests/${id}`,
          },
        });
      },
      withdrawResponse: (id) => dispatch({ type: 'WITHDRAW_RESPONSE', id }),
      markRequestFulfilled: (id) => dispatch({ type: 'MARK_FULFILLED', id }),
      deleteRequest: (id) => dispatch({ type: 'DELETE_REQUEST', id }),
      recordDonation: ({ hospitalName, city, units, requestId }) => {
        const now = new Date();
        dispatch({
          type: 'ADD_DONATION',
          payload: {
            id: uid('dn'),
            hospitalName,
            city,
            units,
            requestId,
            bloodGroup: state.user.bloodGroup,
            date: toISODate(now),
            certificateNo: `LL-${String(now.getFullYear()).slice(2)}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 8999)}`,
          },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: uid('n'),
            type: 'donation',
            title: 'Donation Completed',
            body: `Your donation at ${hospitalName} has been recorded. Thank you for saving lives!`,
            createdAt: now.toISOString(),
            read: false,
            link: '/profile/donations',
          },
        });
      },
      markNotificationRead: (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', id }),
      markAllNotificationsRead: () => dispatch({ type: 'MARK_ALL_READ' }),
      deleteNotification: (id) => dispatch({ type: 'DELETE_NOTIFICATION', id }),
      clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
      updateSettings: (payload) => dispatch({ type: 'UPDATE_SETTINGS', payload }),
      addChatMessage: (role, text) =>
        dispatch({ type: 'ADD_CHAT', payload: { id: uid('m'), role, text, createdAt: new Date().toISOString() } }),
      clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
      resetDemoData: async () => {
        await clearSnapshot();
        dispatch({ type: 'RESET_DEMO' });
      },
    }),
    [state.user.bloodGroup],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export function useEligibility() {
  const { state } = useApp();
  const last = state.donations.reduce<string | undefined>(
    (latest, d) => (!latest || parseDate(d.date) > parseDate(latest) ? d.date : latest),
    undefined,
  );
  const nextEligible = last ? addMonths(last, DONATION_INTERVAL_MONTHS) : new Date();
  const eligible = nextEligible.getTime() <= Date.now();
  return { lastDonation: last, nextEligible: toISODate(nextEligible), eligible };
}

export function useStats() {
  const { state } = useApp();
  const earnedBadges = badges.filter((b) => b.earnedAt).length;
  return {
    donations: state.donations.length,
    accepted: PAST_ACCEPTED_REQUESTS + state.respondedRequestIds.length,
    requests: state.requests.length,
    unread: state.notifications.filter((n) => !n.read).length,
    urgent: state.requests.filter((r) => r.status === 'active' && r.urgency !== 'normal').length,
    livesSaved: state.user.livesSaved,
    rating: state.user.rating,
    badges: earnedBadges,
  };
}
