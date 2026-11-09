import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { DONATION_INTERVAL_MONTHS } from '@/constants/bloodGroups';
import { badges as demoBadges } from '@/data/badges';
import { seedDonations } from '@/data/donations';
import { donors as demoDonors } from '@/data/donors';
import { hospitals as demoHospitals } from '@/data/hospitals';
import { createSeedNotifications } from '@/data/notifications';
import { createSeedRequests, PAST_ACCEPTED_REQUESTS } from '@/data/requests';
import { defaultSettings, demoUser } from '@/data/user';
import * as api from '@/services/api';
import { isLive, supabase } from '@/services/backend';
import { clearSnapshot, loadSnapshot, saveSnapshot } from '@/services/storage';
import type {
  AppNotification,
  AppSettings,
  Availability,
  Badge,
  BloodRequest,
  ChatMessage,
  Donation,
  Donor,
  Hospital,
  UserProfile,
} from '@/types';
import { addMonths, parseDate, toISODate } from '@/utils/date';

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export interface AppState {
  hydrated: boolean;
  /** 'live' = shared LifeLink backend, 'demo' = bundled mock data */
  mode: 'demo' | 'live';
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  user: UserProfile;
  settings: AppSettings;
  requests: BloodRequest[];
  notifications: AppNotification[];
  donations: Donation[];
  donors: Donor[];
  hospitals: Hospital[];
  badges: Badge[];
  /** Requests the user has responded to */
  respondedRequestIds: string[];
  /** Live mode: server-side counters (accepted requests etc.) */
  summary: api.Summary | null;
  syncing: boolean;
  lastSyncAt?: string;
  chat: ChatMessage[];
}

type PersistedState = Omit<AppState, 'hydrated' | 'syncing' | 'mode'>;

const emptyLiveUser: UserProfile = {
  ...demoUser,
  id: '',
  name: '',
  email: '',
  phone: '',
  area: '',
  verified: false,
  livesSaved: 0,
  rating: 0,
  age: 0,
  weightKg: 0,
  avatarUri: undefined,
};

const createInitialState = (): AppState =>
  isLive
    ? {
        hydrated: false,
        mode: 'live',
        hasOnboarded: false,
        isAuthenticated: false,
        user: emptyLiveUser,
        settings: defaultSettings,
        requests: [],
        notifications: [],
        donations: [],
        donors: [],
        hospitals: [],
        badges: [],
        respondedRequestIds: [],
        summary: null,
        syncing: false,
        chat: [],
      }
    : {
        hydrated: false,
        mode: 'demo',
        hasOnboarded: false,
        isAuthenticated: false,
        user: demoUser,
        settings: defaultSettings,
        requests: createSeedRequests(),
        notifications: createSeedNotifications(),
        donations: seedDonations,
        donors: demoDonors,
        hospitals: demoHospitals,
        badges: demoBadges,
        respondedRequestIds: [],
        summary: null,
        syncing: false,
        chat: [],
      };

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type NewRequestInput = Omit<
  BloodRequest,
  'id' | 'createdAt' | 'respondedCount' | 'status' | 'distanceKm' | 'isMine'
>;

type SyncPayload = Partial<
  Pick<AppState, 'user' | 'settings' | 'requests' | 'notifications' | 'donations' | 'donors' | 'hospitals' | 'badges' | 'respondedRequestIds' | 'summary'>
>;

type Action =
  | { type: 'HYDRATE'; payload: Partial<PersistedState> | null }
  | { type: 'SYNC'; payload: SyncPayload }
  | { type: 'SYNCING'; value: boolean }
  | { type: 'UPSERT_DONOR'; payload: Donor }
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
    case 'SYNC':
      return { ...state, ...action.payload, lastSyncAt: new Date().toISOString() };
    case 'SYNCING':
      return { ...state, syncing: action.value };
    case 'UPSERT_DONOR': {
      const exists = state.donors.some((d) => d.id === action.payload.id);
      return {
        ...state,
        donors: exists ? state.donors.map((d) => (d.id === action.payload.id ? { ...d, ...action.payload } : d)) : [...state.donors, action.payload],
      };
    }
    case 'COMPLETE_ONBOARDING':
      return { ...state, hasOnboarded: true };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, hasOnboarded: true };
    case 'LOGOUT':
      return state.mode === 'live'
        ? { ...createInitialState(), hydrated: true, hasOnboarded: true, settings: state.settings }
        : { ...state, isAuthenticated: false, chat: [] };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_AVAILABILITY':
      return { ...state, user: { ...state.user, availability: action.payload } };
    case 'ADD_REQUEST':
      return { ...state, requests: [action.payload, ...state.requests.filter((r) => r.id !== action.payload.id)] };
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
        requests: state.requests.map((r) => (r.id === action.id ? { ...r, status: 'fulfilled', serverStatus: r.serverStatus ? 'fulfilled' : undefined } : r)),
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
/* Error reporting (wired to the toast system by the root layout)      */
/* ------------------------------------------------------------------ */

let reportError: (message: string) => void = (m) => console.warn('[LifeLink]', m);
export function setErrorReporter(fn: (message: string) => void) {
  reportError = fn;
}
const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface AppActions {
  completeOnboarding: () => void;
  login: () => void;
  logout: () => Promise<void>;
  /** Live mode: reload everything from the server (pull-to-refresh). */
  refresh: () => Promise<void>;
  updateUser: (patch: Partial<UserProfile>) => Promise<boolean>;
  setAvailability: (value: Availability) => Promise<boolean>;
  createRequest: (input: NewRequestInput) => Promise<BloodRequest | null>;
  respondToRequest: (id: string) => Promise<boolean>;
  withdrawResponse: (id: string) => Promise<boolean>;
  markRequestFulfilled: (id: string) => Promise<boolean>;
  deleteRequest: (id: string) => Promise<boolean>;
  recordDonation: (input: { hospitalName: string; city: Donation['city']; units: number; requestId?: string }) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  /** Live mode: load full public profile for a donor (age, about, member since). */
  loadDonor: (id: string) => Promise<void>;
  /** Returns the donor's phone number (live mode: signed-in only, logged server-side). */
  getDonorContact: (id: string) => Promise<{ name: string; phone: string } | null>;
  addChatMessage: (role: ChatMessage['role'], text: string) => void;
  clearChat: () => void;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<{ state: AppState; actions: AppActions } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const skipNextSave = useRef(true);
  // Latest state for async actions (updated after each commit, never during render).
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  // City of the signed-in user as soon as the profile loads (drives distance estimates).
  const cityRef = useRef<string | undefined>(undefined);

  /* ---------------- live sync helpers ---------------- */
  const sync = useMemo(() => {
    const city = () => cityRef.current ?? stateRef.current.user.city;
    const guard = async (label: string, fn: () => Promise<void>) => {
      try {
        await fn();
      } catch (e) {
        const msg = errorText(e);
        if (/sign in|JWT|session/i.test(msg)) {
          dispatch({ type: 'LOGOUT' });
          return;
        }
        console.warn(`[LifeLink] ${label} failed:`, msg);
        throw e;
      }
    };
    const me = () =>
      guard('profile', async () => {
        const r = await api.fetchMe(stateRef.current.settings);
        cityRef.current = r.user.city;
        dispatch({ type: 'SYNC', payload: { user: r.user, settings: r.settings, summary: r.summary } });
      });
    const requests = () =>
      guard('requests', async () => {
        const r = await api.fetchRequests(city());
        dispatch({ type: 'SYNC', payload: { requests: r.requests, respondedRequestIds: r.respondedIds } });
      });
    const notifications = () => guard('notifications', async () => dispatch({ type: 'SYNC', payload: { notifications: await api.fetchNotifications() } }));
    const donations = () => guard('donations', async () => dispatch({ type: 'SYNC', payload: { donations: await api.fetchDonations() } }));
    const badges = () => guard('badges', async () => dispatch({ type: 'SYNC', payload: { badges: await api.fetchBadges() } }));
    const donors = () => guard('donors', async () => dispatch({ type: 'SYNC', payload: { donors: await api.fetchDonors(city()) } }));
    const hospitals = () => guard('hospitals', async () => dispatch({ type: 'SYNC', payload: { hospitals: await api.fetchHospitals(city()) } }));
    /** force: run even if the state ref has not re-rendered with isAuthenticated yet (right after sign-in). */
    const all = async (silent = false, force = false) => {
      if (!isLive || (!force && !stateRef.current.isAuthenticated)) return;
      dispatch({ type: 'SYNCING', value: true });
      try {
        await me(); // city is needed for distance estimates
        const results = await Promise.allSettled([requests(), notifications(), donations(), badges(), donors(), hospitals()]);
        const failed = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        if (failed && !silent) reportError(errorText(failed.reason));
      } catch (e) {
        if (!silent) reportError(errorText(e));
      } finally {
        dispatch({ type: 'SYNCING', value: false });
      }
    };
    return { me, requests, notifications, donations, badges, donors, hospitals, all };
  }, []);

  // Hydrate: cached snapshot first, then (live) the real session.
  useEffect(() => {
    let alive = true;
    (async () => {
      const snapshot = await loadSnapshot<PersistedState>();
      if (!alive) return;
      if (isLive && supabase) {
        const { data } = await supabase.auth.getSession();
        const signedIn = !!data.session;
        dispatch({
          type: 'HYDRATE',
          payload: signedIn ? { ...(snapshot ?? {}), isAuthenticated: true, hasOnboarded: true } : { hasOnboarded: snapshot?.hasOnboarded ?? false },
        });
        // Not silent: a failed first load must show an error, not look like "no donors / no requests".
        if (signedIn) sync.all(false, true);
      } else {
        dispatch({ type: 'HYDRATE', payload: snapshot });
      }
    })();
    return () => {
      alive = false;
    };
  }, [sync]);

  // Live: follow auth changes (sign-out elsewhere, expired refresh token).
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && stateRef.current.isAuthenticated) dispatch({ type: 'LOGOUT' });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Live: realtime updates + refresh when the app returns to the foreground.
  const userId = state.user.id;
  useEffect(() => {
    if (!supabase || !state.isAuthenticated || !userId) return;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const later = (key: string, fn: () => Promise<void>) => {
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => fn().catch(() => undefined), 500));
    };
    const channel = supabase
      .channel(`app-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => later('requests', sync.requests))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_responses' }, () => later('requests', sync.requests))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        later('notifications', sync.notifications);
        later('me', sync.me);
        later('badges', sync.badges);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donor_availability' }, () => {
        later('donors', sync.donors);
        later('me', sync.me);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospital_inventory' }, () => later('hospitals', sync.hospitals))
      .subscribe();
    const appState = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') sync.all(true);
    });
    return () => {
      timers.forEach(clearTimeout);
      supabase?.removeChannel(channel);
      appState.remove();
    };
  }, [state.isAuthenticated, userId, sync]);

  // Persist after every change once hydrated (offline cache in live mode).
  useEffect(() => {
    if (!state.hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const { hydrated: _h, syncing: _s, mode: _m, ...persisted } = state;
    const t = setTimeout(() => saveSnapshot(persisted), 250);
    return () => clearTimeout(t);
  }, [state]);

  const actions = useMemo<AppActions>(() => {
    /** Run a server call; on failure show the error and reload the affected data (undo optimistic UI). */
    const live = async (fn: () => Promise<unknown>, after: (() => Promise<void>)[] = []): Promise<boolean> => {
      try {
        await fn();
        await Promise.allSettled(after.map((f) => f()));
        return true;
      } catch (e) {
        reportError(errorText(e));
        await Promise.allSettled(after.map((f) => f()));
        return false;
      }
    };

    return {
      completeOnboarding: () => dispatch({ type: 'COMPLETE_ONBOARDING' }),
      login: () => {
        dispatch({ type: 'LOGIN' });
        if (isLive) sync.all(false, true);
      },
      logout: async () => {
        if (isLive) {
          await api.signOut();
          await clearSnapshot();
        }
        dispatch({ type: 'LOGOUT' });
      },
      refresh: () => sync.all(),
      updateUser: async (payload) => {
        dispatch({ type: 'UPDATE_USER', payload });
        if (!isLive) return true;
        const prev = stateRef.current.user;
        return live(async () => {
          const patch = { ...payload };
          if (payload.avatarUri && !/^https?:/.test(payload.avatarUri)) {
            patch.avatarPath = await api.uploadAvatar(prev.id, payload.avatarUri);
          }
          await api.updateProfile(patch);
          if (payload.email && payload.email.trim().toLowerCase() !== prev.email.toLowerCase()) {
            await api.changeEmail(payload.email);
            reportError('Check your new inbox to confirm the email change.');
          }
        }, [sync.me, sync.donors]);
      },
      setAvailability: async (payload) => {
        dispatch({ type: 'SET_AVAILABILITY', payload });
        if (!isLive) return true;
        return live(() => api.setAvailability(payload), [sync.me, sync.donors]);
      },
      createRequest: async (input) => {
        if (isLive) {
          try {
            const created = await api.createRequest(input, stateRef.current.user.city);
            dispatch({ type: 'ADD_REQUEST', payload: created });
            setTimeout(() => sync.notifications().catch(() => undefined), 600);
            return created;
          } catch (e) {
            reportError(errorText(e));
            return null;
          }
        }
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
      respondToRequest: async (id) => {
        dispatch({ type: 'RESPOND_REQUEST', id });
        if (isLive) return live(() => api.respondToRequest(id), [sync.requests, sync.me, sync.notifications]);
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
        return true;
      },
      withdrawResponse: async (id) => {
        dispatch({ type: 'WITHDRAW_RESPONSE', id });
        return isLive ? live(() => api.withdrawResponse(id), [sync.requests, sync.me]) : true;
      },
      markRequestFulfilled: async (id) => {
        dispatch({ type: 'MARK_FULFILLED', id });
        return isLive ? live(() => api.markRequestFulfilled(id), [sync.requests]) : true;
      },
      deleteRequest: async (id) => {
        dispatch({ type: 'DELETE_REQUEST', id });
        // Live: requests are never hard-deleted by users; they are cancelled (keeps the audit trail).
        return isLive ? live(() => api.cancelRequest(id), [sync.requests]) : true;
      },
      recordDonation: async ({ hospitalName, city, units, requestId }) => {
        if (isLive) {
          return live(() => api.recordDonation({ hospitalName, units, requestId }), [sync.donations, sync.me, sync.requests, sync.badges, sync.notifications]);
        }
        const now = new Date();
        dispatch({
          type: 'ADD_DONATION',
          payload: {
            id: uid('dn'),
            hospitalName,
            city,
            units,
            requestId,
            bloodGroup: stateRef.current.user.bloodGroup,
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
        return true;
      },
      markNotificationRead: (id) => {
        dispatch({ type: 'MARK_NOTIFICATION_READ', id });
        if (isLive) live(() => api.markNotificationRead(id));
      },
      markAllNotificationsRead: () => {
        dispatch({ type: 'MARK_ALL_READ' });
        if (isLive) live(() => api.markAllNotificationsRead());
      },
      deleteNotification: (id) => {
        dispatch({ type: 'DELETE_NOTIFICATION', id });
        if (isLive) live(() => api.deleteNotification(id));
      },
      clearNotifications: () => {
        dispatch({ type: 'CLEAR_NOTIFICATIONS' });
        if (isLive) live(() => api.clearNotifications(stateRef.current.user.id), [sync.notifications]);
      },
      updateSettings: (payload) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload });
        if (isLive) live(() => api.updateSettings(stateRef.current.user.id, payload), [sync.me]);
      },
      loadDonor: async (id) => {
        if (!isLive) return;
        try {
          const d = await api.fetchDonorDetails(id, stateRef.current.user.city);
          if (d) dispatch({ type: 'UPSERT_DONOR', payload: d });
        } catch (e) {
          reportError(errorText(e));
        }
      },
      getDonorContact: async (id) => {
        if (!isLive) {
          const d = stateRef.current.donors.find((x) => x.id === id);
          return d ? { name: d.name, phone: d.phone } : null;
        }
        try {
          return await api.getDonorContact(id);
        } catch (e) {
          reportError(errorText(e));
          return null;
        }
      },
      addChatMessage: (role, text) =>
        dispatch({ type: 'ADD_CHAT', payload: { id: uid('m'), role, text, createdAt: new Date().toISOString() } }),
      clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
      resetDemoData: async () => {
        if (isLive) return sync.all();
        await clearSnapshot();
        dispatch({ type: 'RESET_DEMO' });
      },
    };
  }, [sync]);

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
  const [now] = useState(() => Date.now());
  const nextEligible = last ? addMonths(last, DONATION_INTERVAL_MONTHS) : new Date(now);
  const eligible = nextEligible.getTime() <= now;
  return { lastDonation: last, nextEligible: toISODate(nextEligible), eligible };
}

const isOpen = (r: BloodRequest) => r.status === 'active';

export function useStats() {
  const { state } = useApp();
  const live = state.mode === 'live';
  return {
    donations: state.donations.length,
    accepted: live ? (state.summary?.accepted ?? state.respondedRequestIds.length) : PAST_ACCEPTED_REQUESTS + state.respondedRequestIds.length,
    requests: state.requests.length,
    unread: state.notifications.filter((n) => !n.read).length,
    urgent: state.requests.filter((r) => isOpen(r) && r.urgency !== 'normal').length,
    livesSaved: state.user.livesSaved,
    rating: state.user.rating,
    badges: state.badges.filter((b) => b.earnedAt).length,
  };
}
