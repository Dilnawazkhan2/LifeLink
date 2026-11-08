import { ChevronRight } from 'lucide-react-native';
import type { ComponentType, ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';

/** Any icon component taking lucide-style props (lucide icons or custom SVG icons). */
export type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

/* -------------------------------- IconTile -------------------------------- */

export function IconTile({
  icon: Icon,
  color,
  bg,
  size = 56,
  iconSize,
  radius,
  children,
  style,
}: {
  icon?: IconType;
  color: string;
  bg: string;
  size?: number;
  iconSize?: number;
  radius?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: radius ?? size * 0.3, backgroundColor: bg },
        styles.center,
        style,
      ]}>
      {Icon ? <Icon size={iconSize ?? size * 0.42} color={color} strokeWidth={2} /> : children}
    </View>
  );
}

/* ------------------------------ SectionHeader ----------------------------- */

export function SectionHeader({
  title,
  icon,
  action,
  onAction,
  badge,
  style,
}: {
  title: string;
  icon?: ReactNode;
  action?: string;
  onAction?: () => void;
  badge?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      {icon}
      <Text style={styles.sectionTitle} numberOfLines={1}>
        {title}
      </Text>
      {badge}
      <View style={{ flex: 1 }} />
      {action && (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------------------------------- Pill ---------------------------------- */

export function Pill({
  label,
  color,
  bg,
  border,
  icon,
  style,
  size = 'md',
}: {
  label: string;
  color: string;
  bg: string;
  border?: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md';
}) {
  return (
    <View
      style={[
        styles.pill,
        size === 'sm' && styles.pillSm,
        { backgroundColor: bg, borderColor: border ?? bg },
        style,
      ]}>
      {icon}
      <Text style={[styles.pillText, size === 'sm' && { fontSize: 12 }, { color }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: IconType;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <IconTile icon={Icon} color={Colors.primary} bg={Colors.primarySoft} size={72} radius={24} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action}
    </View>
  );
}

/* --------------------------------- ListRow -------------------------------- */

export function ListRow({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  right,
  titleColor,
  last,
}: {
  icon: IconType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  titleColor?: string;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.listRow, !last && styles.listRowBorder, pressed && { opacity: 0.7 }]}>
      <IconTile icon={Icon} color={iconColor} bg={iconBg} size={54} iconSize={22} radius={16} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, titleColor ? { color: titleColor } : null]}>{title}</Text>
        {subtitle && <Text style={styles.listSubtitle}>{subtitle}</Text>}
      </View>
      {right}
      {onPress && <ChevronRight size={20} color="#CBD5E1" />}
    </Pressable>
  );
}

/* -------------------------------- InfoRow --------------------------------- */

export function InfoRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  last,
}: {
  icon: IconType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.listRow, !last && styles.listRowBorder]}>
      <IconTile icon={icon} color={iconColor} bg={iconBg} size={54} iconSize={22} radius={16} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

/* ------------------------------- ToggleRow -------------------------------- */

export function ToggleRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  value,
  onValueChange,
  last,
}: {
  icon: IconType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.listRow, !last && styles.listRowBorder]}>
      <IconTile icon={icon} color={iconColor} bg={iconBg} size={46} iconSize={20} radius={14} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, { fontSize: 16 }]}>{title}</Text>
        {subtitle && <Text style={[styles.listSubtitle, { fontSize: 13 }]}>{subtitle}</Text>}
      </View>
      <AppSwitch value={value} onValueChange={onValueChange} accessibilityLabel={title} />
    </View>
  );
}

export function AppSwitch({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#D5DAE3', true: '#6EE7B7' }}
      thumbColor={value ? Colors.success : '#F8FAFC'}
      ios_backgroundColor="#D5DAE3"
      accessibilityLabel={accessibilityLabel}
    />
  );
}

/* --------------------------------- Divider -------------------------------- */

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[{ height: 1, backgroundColor: Colors.divider }, style]} />
);

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: Colors.text, flexShrink: 1 },
  sectionAction: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillSm: { height: 24, paddingHorizontal: 8, gap: 4 },
  pillText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 6 },
  emptyMessage: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  listTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  listSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 3 },
  infoLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  infoValue: { fontSize: 17, color: Colors.text, fontWeight: '600', marginTop: 3 },
});
