import { Platform, type ViewStyle } from 'react-native';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  caption: 13,
  body: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  hero: 28,
  display: 40,
} as const;

/** Hides the browser focus outline on TextInputs when running on web. */
export const webNoOutline = (Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as object;

/** Page gutter used by every scroll screen. */
export const SCREEN_PADDING = 20;

/** Height of the custom tab bar (without the bottom inset). */
export const TAB_BAR_HEIGHT = 66;

const shadow = (elevation: number, opacity: number, radius: number, y: number, color = '#0F172A'): ViewStyle =>
  Platform.select<ViewStyle>({
    android: { elevation, shadowColor: color },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    },
  }) ?? {};

export const Shadows = {
  card: shadow(2, 0.06, 12, 4),
  soft: shadow(1, 0.04, 8, 2),
  raised: shadow(6, 0.12, 16, 8),
  primary: shadow(8, 0.3, 14, 8, '#C41E3A'),
  success: shadow(6, 0.25, 12, 6, '#10B981'),
  info: shadow(6, 0.25, 12, 6, '#3B82F6'),
} as const;
