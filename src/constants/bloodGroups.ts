import type { BloodGroup } from '@/types';

export interface BloodTone {
  text: string;
  bg: string;
  border: string;
}

/** Badge colors per blood group (O+ red, O- amber, B+ blue, AB+ purple as in the screenshots). */
export const BloodGroupTones: Record<BloodGroup, BloodTone> = {
  'O+': { text: '#C41E3A', bg: '#FFF1F2', border: '#FECDD3' },
  'O-': { text: '#92400E', bg: '#FFFBEB', border: '#FDE68A' },
  'B+': { text: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  'B-': { text: '#0E7490', bg: '#ECFEFF', border: '#A5F3FC' },
  'A+': { text: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  'A-': { text: '#BE185D', bg: '#FDF2F8', border: '#FBCFE8' },
  'AB+': { text: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  'AB-': { text: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
};

/** Who each group can donate red cells to. */
export const CanDonateTo: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

/** Who each group can receive red cells from. */
export const CanReceiveFrom: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

/** Months a donor must wait between whole-blood donations (≈ 90 days). */
export const DONATION_INTERVAL_MONTHS = 3;
