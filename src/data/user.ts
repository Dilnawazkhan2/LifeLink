import type { AppSettings, UserProfile } from '@/types';

/** Demo account (frontend only — no real authentication). */
export const DEMO_CREDENTIALS = {
  email: 'umer.abdullah@email.com',
  password: 'lifelink123',
} as const;

export const demoUser: UserProfile = {
  id: 'u-umer',
  name: 'Umer Abdullah',
  email: DEMO_CREDENTIALS.email,
  phone: '+92-300-5551234',
  bloodGroup: 'O+',
  city: 'Karachi',
  area: 'DHA Phase 6',
  role: 'both',
  verified: true,
  availability: 'available',
  livesSaved: 19,
  rating: 4.8,
  age: 27,
  weightKg: 72,
  gender: 'Male',
  memberSince: '2022-11-05',
};

export const defaultSettings: AppSettings = {
  pushNotifications: true,
  emergencyAlerts: true,
  emailUpdates: false,
  smsAlerts: true,
  showInSearch: true,
  shareLocation: true,
  searchRadiusKm: 10,
};
