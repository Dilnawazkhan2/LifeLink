/**
 * LifeLink color palette — sampled from the reference screenshots.
 */
export const Colors = {
  primary: '#C41E3A',
  primaryDark: '#8B1028',
  primaryDeep: '#7A0E22',
  primarySoft: '#FFF1F2',
  primaryBorder: '#FECDD3',
  primaryTint: '#FDE4E8',

  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FB',
  inputBg: '#F6F7FA',
  border: '#ECEEF3',
  borderStrong: '#E2E5EC',
  divider: '#EEF0F4',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textFaint: '#B6BFCC',
  white: '#FFFFFF',
  black: '#000000',

  success: '#10B981',
  successDark: '#059669',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',

  info: '#3B82F6',
  infoDark: '#2563EB',
  infoSoft: '#EFF6FF',
  infoBorder: '#BFDBFE',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningSoft: '#FFFBEB',
  warningBorder: '#FDE68A',

  urgent: '#F97316',
  urgentDark: '#EA580C',
  urgentSoft: '#FFF7ED',

  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',

  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  purpleSoft: '#F5F3FF',
  purpleBorder: '#DDD6FE',

  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

/** Gradients used across the app (top-left → bottom-right). */
export const Gradients = {
  primary: ['#D7263D', '#C41E3A', '#8B1028'] as const,
  emergency: ['#DC2626', '#C41E3A', '#9B1C2E'] as const,
  donate: ['#D21F3C', '#8B1028'] as const,
  success: ['#10B981', '#047857'] as const,
};

/** Accent sets for onboarding slides & feature tiles. */
export const Accents = {
  red: { main: '#C41E3A', bgTop: '#FFF1F2', bgBottom: '#FECDD3', soft: '#FFF1F2' },
  blue: { main: '#3B82F6', bgTop: '#EFF6FF', bgBottom: '#DBEAFE', soft: '#EFF6FF' },
  green: { main: '#10B981', bgTop: '#F0FDF4', bgBottom: '#D1FAE5', soft: '#ECFDF5' },
  amber: { main: '#F59E0B', bgTop: '#FFFBEB', bgBottom: '#FEF3C7', soft: '#FFFBEB' },
  purple: { main: '#8B5CF6', bgTop: '#F5F3FF', bgBottom: '#EDE9FE', soft: '#F5F3FF' },
} as const;

export type AccentName = keyof typeof Accents;
