import type { Availability, AccountRole } from '@/types';

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const firstName = (name: string) => name.split(' ')[0] ?? name;

/** 0 = same city without precise coordinates (live mode estimates distance from city centres). */
export const formatDistance = (km: number) =>
  km <= 0 ? 'Your city' : km >= 9999 ? '—' : km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString('en-US')} km`;

/** "12 km away" for real distances; "Your city" / "—" stay as they are (no "Your city away"). */
export const formatDistanceAway = (km: number) => (km > 0 && km < 9999 ? `${formatDistance(km)} away` : formatDistance(km));

export const formatCount = (n: number) => n.toLocaleString('en-US');

export const pluralize = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const roleLabel = (role: AccountRole) =>
  role === 'both' ? 'Donor & Recipient' : role === 'donor' ? 'Donor' : 'Recipient';

export const availabilityLabel: Record<Availability, string> = {
  available: 'Available',
  resting: 'Resting',
  busy: 'Busy',
};

/** "Area, City" without dangling commas when either part is missing. */
export const place = (area?: string, city?: string) => [area, city].map((s) => s?.trim()).filter(Boolean).join(', ');
