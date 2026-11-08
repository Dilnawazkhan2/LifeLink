import type { Availability, AccountRole } from '@/types';

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const firstName = (name: string) => name.split(' ')[0] ?? name;

export const formatDistance = (km: number) =>
  km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString('en-US')} km`;

export const formatCount = (n: number) => n.toLocaleString('en-US');

export const pluralize = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const roleLabel = (role: AccountRole) =>
  role === 'both' ? 'Donor & Recipient' : role === 'donor' ? 'Donor' : 'Recipient';

export const availabilityLabel: Record<Availability, string> = {
  available: 'Available',
  resting: 'Resting',
  busy: 'Busy',
};
