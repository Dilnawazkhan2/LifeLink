import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Gradients } from '@/constants/colors';
import { Shadows } from '@/constants/theme';

type Variant = 'gradient' | 'solid' | 'outline' | 'soft' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** solid background colour (for accent buttons, e.g. onboarding green) */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHTS = { sm: 38, md: 48, lg: 58 } as const;
const RADII = { sm: 12, md: 14, lg: 20 } as const;
const FONTS = { sm: 14, md: 16, lg: 18 } as const;

export function Button({
  label,
  onPress,
  variant = 'gradient',
  color,
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth = true,
  style,
}: ButtonProps) {
  const h = HEIGHTS[size];
  const r = RADII[size];
  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? color ?? Colors.primary
      : variant === 'soft'
        ? color ?? Colors.primary
        : Colors.white;

  const inner = (
    <View style={[styles.inner, { height: h }]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: textColor, fontSize: FONTS[size] }]}>{label}</Text>
          {iconRight}
        </>
      )}
    </View>
  );

  const containerBase: StyleProp<ViewStyle> = [
    { borderRadius: r, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
    (disabled || loading) && { opacity: 0.6 },
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        containerBase,
        variant === 'gradient' && !color && Shadows.primary,
        variant === 'solid' && { backgroundColor: color ?? Colors.primary },
        variant === 'danger' && { backgroundColor: Colors.danger },
        variant === 'outline' && { borderWidth: 1.5, borderColor: color ?? Colors.primary, backgroundColor: Colors.surface },
        variant === 'soft' && { backgroundColor: color ? `${color}1A` : Colors.primarySoft },
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        style,
      ]}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={color ? [color, color] : [Gradients.primary[0], Gradients.primary[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: r }}>
          {inner}
        </LinearGradient>
      ) : (
        inner
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  label: { fontWeight: '700' },
});
