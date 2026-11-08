import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { SCREEN_PADDING } from '@/constants/theme';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /** "outline" = blood group / status pills, "soft" = sort chips, "toggle" = radio-style on/off */
  variant?: 'outline' | 'soft' | 'toggle';
  count?: number;
  left?: ReactNode;
}

export function Chip({ label, active = false, onPress, variant = 'outline', count, left }: ChipProps) {
  const isOutline = variant === 'outline';
  const isToggle = variant === 'toggle';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.base,
        isOutline && (active ? styles.outlineActive : styles.outline),
        variant === 'soft' && (active ? styles.softActive : styles.soft),
        isToggle && (active ? styles.toggleActive : styles.toggle),
        pressed && { opacity: 0.8 },
      ]}>
      {isToggle && (
        <View style={[styles.radio, active && styles.radioActive]}>{active && <View style={styles.radioDot} />}</View>
      )}
      {left}
      <Text
        style={[
          styles.label,
          isOutline && { color: active ? Colors.white : Colors.textMuted, fontSize: 16 },
          variant === 'soft' && { color: active ? Colors.primary : Colors.textMuted, fontWeight: active ? '700' : '500' },
          isToggle && { color: active ? Colors.successDark : Colors.textMuted },
        ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={styles.count}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Horizontally scrolling chip row that bleeds to the screen edges. */
export function ChipRow({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[{ marginHorizontal: -SCREEN_PADDING, flexGrow: 0 }, style]}
      contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, gap: 9, alignItems: 'center' }}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
  },
  outline: {
    height: 36,
    paddingHorizontal: 15,
    minWidth: 46,
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  outlineActive: {
    height: 36,
    paddingHorizontal: 15,
    minWidth: 46,
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  soft: { height: 32, paddingHorizontal: 10, backgroundColor: '#EEF1F6', borderRadius: 10 },
  softActive: { height: 32, paddingHorizontal: 10, backgroundColor: Colors.primarySoft, borderRadius: 10 },
  toggle: {
    height: 32,
    paddingHorizontal: 11,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: 10,
  },
  toggleActive: {
    height: 32,
    paddingHorizontal: 11,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: 10,
  },
  label: { fontSize: 15, fontWeight: '600' },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.success },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
});
