/**
 * LIVE backend API (Supabase / LifeLink local dev server).
 * Every function maps database rows to the app's existing domain types, so
 * screens and the store work the same in demo and live mode.
 * Business rules (validation, permissions, status workflow) live in the database.
 */
import { estimateDistanceKm } from '@/constants/cities';
import type {
  AccountRole,
  AppNotification,
  AppSettings,
  Availability,
  Badge,
  BloodGroup,
  BloodRequest,
  Donation,
  Donor,
  Hospital,
  HospitalType,
  RequestStatus,
  UserProfile,
} from '@/types';
import { BLOOD_GROUPS } from '@/types';

import { avatarUrl, requireClient } from './backend';

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

function friendly(err: { message?: string; code?: string } | null | undefined): ApiError {
  const msg = err?.message ?? 'Something went wrong';
  if (/Failed to fetch|Network request failed|NetworkError|Load failed/i.test(msg)) {
    return new ApiError('Cannot reach the LifeLink server. Check your internet connection.', 'network');
  }
  if (/Invalid login credentials/i.test(msg)) return new ApiError('Invalid email or password.', err?.code);
  if (/User already registered/i.test(msg)) return new ApiError('An account with this email already exists.', err?.code);
  if (/Email not confirmed/i.test(msg)) return new ApiError('Please confirm your email first — check your inbox.', err?.code);
  return new ApiError(msg, err?.code);
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await requireClient().rpc(fn, args ?? {});
  if (error) throw friendly(error);
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Mappers                                                             */
/* ------------------------------------------------------------------ */

const asGroup = (g: unknown): BloodGroup => ((BLOOD_GROUPS as readonly string[]).includes(String(g)) ? (g as BloodGroup) : 'O+');
const asGender = (g: unknown): 'Male' | 'Female' => (g === 'female' ? 'Female' : 'Male');
const ageFromDob = (dob?: string | null) => {
  if (!dob) return 0;
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age;
};
const dobFromAge = (age: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d.toISOString().slice(0, 10);
};

/** Untyped JSON row from the database (mapped to domain types below). */
type Row = Record<string, any>;

export interface Summary {
  accepted: number;
  donations: number;
  livesSaved: number;
  badges: number;
  isStaff: boolean;
}

export function mapProfile(p: Row, summary?: Row | null): UserProfile {
  return {
    id: p.id,
    name: p.full_name ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    bloodGroup: asGroup(p.blood_group),
    // asGroup falls back to 'O+' for the type; this flag stops that placeholder being shown or saved as real data.
    bloodGroupMissing: !(BLOOD_GROUPS as readonly string[]).includes(String(p.blood_group)),
    city: p.city ?? '',
    area: p.area ?? p.donor?.area ?? '',
    role: (p.account_type ?? 'both') as AccountRole,
    verified: !!p.is_verified,
    availability: (p.donor?.availability ?? summary?.availability ?? 'available') as Availability,
    avatarPath: p.avatar_path ?? undefined,
    avatarUri: avatarUrl(p.avatar_path),
    livesSaved: Number(summary?.lives_saved ?? 0),
    rating: Number(p.donor?.rating ?? 0),
    age: ageFromDob(p.date_of_birth),
    weightKg: Number(p.weight_kg ?? 0),
    gender: asGender(p.gender),
    memberSince: String(p.created_at ?? new Date().toISOString()).slice(0, 10),
    roles: p.roles ?? [],
  };
}

export function mapSettings(prefs: Row | null | undefined, fallback: AppSettings): AppSettings {
  if (!prefs) return fallback;
  return {
    pushNotifications: !!prefs.push_enabled,
    emergencyAlerts: !!prefs.emergency_alerts,
    emailUpdates: !!prefs.email_updates,
    smsAlerts: !!prefs.sms_alerts,
    showInSearch: !!prefs.show_in_search,
    shareLocation: !!prefs.share_location,
    searchRadiusKm: Number(prefs.search_radius_km ?? fallback.searchRadiusKm),
  };
}

const appStatus = (s: string): RequestStatus =>
  s === 'approved' || s === 'active' ? 'active' : (s as RequestStatus);

export function mapRequest(r: Row, userCity?: string): BloodRequest {
  return {
    id: r.id,
    patientName: r.patient_name,
    bloodGroup: asGroup(r.blood_group),
    units: Number(r.units ?? 1),
    hospitalName: r.hospital_name,
    hospitalId: r.hospital_id ?? undefined,
    area: r.hospital_address ?? '',
    city: r.city ?? '',
    description: r.description ?? '',
    contactName: r.contact_name ?? '',
    contactPhone: r.contact_phone ?? '',
    urgency: r.urgency,
    status: appStatus(r.status),
    createdAt: r.created_at,
    respondedCount: Number(r.responded_count ?? 0),
    distanceKm: estimateDistanceKm(userCity, r.city),
    isMine: !!r.is_mine,
    referenceCode: r.reference_code,
    serverStatus: r.status,
    statusReason: r.status_reason ?? undefined,
    source: r.source,
  };
}

export function mapDonor(d: Row, userCity?: string): Donor {
  return {
    id: d.id,
    name: d.full_name ?? 'Donor',
    bloodGroup: asGroup(d.blood_group),
    city: d.city ?? '',
    area: d.area ?? '',
    verified: !!d.is_verified,
    availability: (d.availability ?? 'available') as Availability,
    donations: Number(d.donations_count ?? 0),
    rating: Number(d.rating ?? 0),
    reviews: Number(d.rating_count ?? 0),
    distanceKm: estimateDistanceKm(userCity, d.city),
    hours: d.hours ?? 'Flexible',
    phone: '', // revealed on demand via getDonorContact (signed-in, logged)
    lastDonation: d.last_donation_on ?? '',
    age: Number(d.age ?? 0),
    gender: asGender(d.gender),
    about: d.about ?? '',
    memberSince: String(d.member_since ?? d.created_at ?? '').slice(0, 10),
  };
}

const HOSPITAL_TYPE: Record<string, HospitalType> = { private: 'Private', public: 'Public', semi_government: 'Semi-Government' };

export function mapHospital(h: Row, userCity?: string): Hospital {
  const inventory = Object.fromEntries(BLOOD_GROUPS.map((g) => [g, Number(h.inventory?.[g] ?? 0)])) as Record<BloodGroup, number>;
  return {
    id: h.id,
    name: h.name,
    type: HOSPITAL_TYPE[h.type] ?? 'Private',
    hasBloodBank: !!h.has_blood_bank,
    city: h.city ?? '',
    address: h.address ?? '',
    phone: h.phone ?? '',
    rating: Number(h.rating ?? 0),
    reviews: Number(h.reviews_count ?? 0),
    distanceKm: estimateDistanceKm(userCity, h.city, { lat: h.latitude, lng: h.longitude }),
    open24h: !!h.open_24h,
    verified: !!h.is_verified,
    beds: Number(h.beds ?? 0),
    about: h.about ?? '',
    services: h.services ?? [],
    inventory,
  };
}

export function mapNotification(n: Row): AppNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    createdAt: n.created_at,
    read: !!n.read_at,
    link: n.link ?? undefined,
  };
}

export function mapDonation(d: Row): Donation {
  return {
    id: d.id,
    hospitalName: d.hospital_name,
    city: d.city ?? '',
    date: d.donated_on,
    units: Number(d.units ?? 1),
    bloodGroup: asGroup(d.blood_group),
    requestId: d.request_id ?? undefined,
    certificateNo: d.certificate_no,
  };
}

export function mapBadge(b: Row): Badge {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    icon: b.icon,
    tone: b.tone,
    requirement: b.requirement,
    earnedAt: b.earned_at ? String(b.earned_at).slice(0, 10) : undefined,
    progress: b.earned_at ? undefined : Number(b.progress ?? 0),
  };
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function signIn(email: string, password: string) {
  const { data, error } = await requireClient().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw friendly(error);
  const profile = await rpc<Row | null>('get_my_profile');
  if (profile?.status === 'suspended') {
    await requireClient().auth.signOut();
    throw new ApiError('Your account is suspended. Contact support.');
  }
  return data.session;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  role: AccountRole;
}

/** Returns true when a session was created (no email confirmation required). */
export async function signUp(input: RegisterInput): Promise<boolean> {
  const { data, error } = await requireClient().auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        full_name: input.name.trim(),
        account_type: input.role,
        phone: input.phone.trim(),
        blood_group: input.bloodGroup,
        city: input.city,
        area: input.area.trim(),
      },
    },
  });
  if (error) throw friendly(error);
  return !!data.session;
}

export async function sendPasswordReset(email: string) {
  const { error } = await requireClient().auth.resetPasswordForEmail(email.trim());
  if (error) throw friendly(error);
}

export async function signOut() {
  await requireClient().auth.signOut().catch(() => undefined);
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await requireClient().auth.getSession();
  return data.session?.user.id ?? null;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function fetchMe(fallbackSettings: AppSettings) {
  const [profile, summary] = await Promise.all([rpc<Row | null>('get_my_profile'), rpc<Row | null>('get_my_summary')]);
  if (!profile) throw new ApiError('Please sign in again.', '42501');
  const s: Summary = {
    accepted: Number(summary?.accepted ?? 0),
    donations: Number(summary?.donations ?? 0),
    livesSaved: Number(summary?.lives_saved ?? 0),
    badges: Number(summary?.badges ?? 0),
    isStaff: !!summary?.is_staff,
  };
  return { user: mapProfile(profile, summary), settings: mapSettings(profile.preferences, fallbackSettings), summary: s };
}

export async function fetchRequests(userCity?: string) {
  const rows = await rpc<Row[]>('list_requests', { _scope: 'feed', _limit: 300 });
  const visible = rows.filter((r) => r.status !== 'cancelled' && (r.is_mine || r.status !== 'rejected'));
  return {
    requests: visible.map((r) => mapRequest(r, userCity)),
    respondedIds: rows.filter((r) => r.my_response === 'responded' || r.my_response === 'donated').map((r) => r.id as string),
  };
}

export async function fetchRequest(id: string, userCity?: string) {
  const rows = await rpc<Row[]>('list_requests', { _scope: 'feed', _id: id, _limit: 1 });
  return rows[0] ? mapRequest(rows[0], userCity) : null;
}

export async function fetchNotifications() {
  const { data, error } = await requireClient()
    .from('notifications')
    .select('id,type,title,body,link,read_at,created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw friendly(error);
  return (data ?? []).map(mapNotification);
}

export async function fetchDonations() {
  return (await rpc<Row[]>('list_my_donations')).map(mapDonation);
}

export async function fetchBadges() {
  return (await rpc<Row[]>('list_my_badges')).map(mapBadge);
}

export async function fetchDonors(userCity?: string) {
  const rows = await rpc<Row[]>('search_donors', { _limit: 200, _sort: 'donations' });
  return rows.map((d) => mapDonor(d, userCity));
}

export async function fetchDonorDetails(id: string, userCity?: string) {
  const row = await rpc<Row | null>('get_donor_details', { _donor_id: id });
  return row ? mapDonor(row, userCity) : null;
}

export async function fetchHospitals(userCity?: string) {
  return (await rpc<Row[]>('list_hospitals')).map((h) => mapHospital(h, userCity));
}

/** Reveals a donor's phone number (signed-in users only; logged and rate limited server-side). */
export async function getDonorContact(donorId: string): Promise<{ name: string; phone: string }> {
  const rows = await rpc<Row[]>('get_donor_contact', { _donor_id: donorId });
  const row = rows?.[0];
  if (!row) throw new ApiError('Contact details are not available for this donor.');
  return { name: row.full_name, phone: row.phone };
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export const setAvailability = (status: Availability) => rpc<void>('set_my_availability', { _status: status });

export interface CreateRequestInput {
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: BloodRequest['urgency'];
  hospitalName: string;
  hospitalId?: string;
  area: string;
  city: string;
  contactName: string;
  contactPhone: string;
  description: string;
}

export async function createRequest(input: CreateRequestInput, userCity?: string): Promise<BloodRequest> {
  const rows = await rpc<Row[]>('submit_blood_request', {
    p: {
      patient_name: input.patientName,
      blood_group: input.bloodGroup,
      units: input.units,
      urgency: input.urgency,
      hospital_id: input.hospitalId ?? null,
      hospital_name: input.hospitalName,
      hospital_address: input.area,
      city: input.city,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      description: input.description,
      source: 'android',
    },
  });
  const created = await fetchRequest(rows[0].id, userCity);
  if (!created) throw new ApiError('Request was created but could not be loaded. Pull to refresh.');
  return created;
}

export const respondToRequest = (id: string) => rpc<string>('respond_to_request', { _request_id: id });
export const withdrawResponse = (id: string) => rpc<void>('withdraw_response', { _request_id: id });
export const markRequestFulfilled = (id: string) => rpc<string>('transition_request_status', { _request_id: id, _to: 'fulfilled' });
export const cancelRequest = (id: string) =>
  rpc<string>('transition_request_status', { _request_id: id, _to: 'cancelled', _reason: 'Cancelled by requester' });

export const recordDonation = (input: { requestId?: string; hospitalName: string; units: number }) =>
  rpc<string>('record_donation', { _request_id: input.requestId ?? null, _hospital_name: input.hospitalName, _units: input.units });

export async function markNotificationRead(id: string) {
  const { error } = await requireClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw friendly(error);
}
export const markAllNotificationsRead = () => rpc<number>('mark_all_notifications_read');
export async function deleteNotification(id: string) {
  const { error } = await requireClient().from('notifications').delete().eq('id', id);
  if (error) throw friendly(error);
}
export async function clearNotifications(userId: string) {
  const { error } = await requireClient().from('notifications').delete().eq('user_id', userId);
  if (error) throw friendly(error);
}

export async function updateSettings(userId: string, s: Partial<AppSettings>) {
  const patch: Record<string, unknown> = {};
  if (s.pushNotifications !== undefined) patch.push_enabled = s.pushNotifications;
  if (s.emergencyAlerts !== undefined) patch.emergency_alerts = s.emergencyAlerts;
  if (s.emailUpdates !== undefined) patch.email_updates = s.emailUpdates;
  if (s.smsAlerts !== undefined) patch.sms_alerts = s.smsAlerts;
  if (s.showInSearch !== undefined) patch.show_in_search = s.showInSearch;
  if (s.shareLocation !== undefined) patch.share_location = s.shareLocation;
  if (s.searchRadiusKm !== undefined) patch.search_radius_km = s.searchRadiusKm;
  if (!Object.keys(patch).length) return;
  const { error } = await requireClient().from('notification_preferences').update(patch).eq('user_id', userId);
  if (error) throw friendly(error);
}

/** Uploads a local image (file:// or blob: URI) to avatars/<uid>/ and returns the storage path. */
export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const res = await fetch(uri);
  const buffer = await res.arrayBuffer();
  const type = res.headers.get('content-type')?.startsWith('image/') ? res.headers.get('content-type')! : 'image/jpeg';
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await requireClient().storage.from('avatars').upload(path, buffer, { contentType: type, upsert: true });
  if (error) throw friendly(error);
  return path;
}

export async function updateProfile(patch: Partial<UserProfile>) {
  const p: Record<string, unknown> = {};
  if (patch.name !== undefined) p.full_name = patch.name;
  if (patch.phone !== undefined) p.phone = patch.phone;
  if (patch.bloodGroup !== undefined) p.blood_group = patch.bloodGroup;
  if (patch.city !== undefined) p.city = patch.city;
  if (patch.area !== undefined) p.area = patch.area;
  if (patch.role !== undefined) p.account_type = patch.role;
  if (patch.age !== undefined && patch.age > 0) p.date_of_birth = dobFromAge(patch.age);
  if (patch.gender !== undefined) p.gender = patch.gender.toLowerCase();
  if (patch.weightKg !== undefined && patch.weightKg > 0) p.weight_kg = patch.weightKg;
  if (patch.avatarPath !== undefined) p.avatar_path = patch.avatarPath;
  if (Object.keys(p).length) await rpc<Row>('update_my_profile', { p });
}

/** Email changes go through Supabase Auth (a confirmation link is sent to the new address). */
export async function changeEmail(email: string) {
  const { error } = await requireClient().auth.updateUser({ email: email.trim().toLowerCase() });
  if (error) throw friendly(error);
}
