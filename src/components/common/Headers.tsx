import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { SCREEN_PADDING, Shadows } from '@/constants/theme';

/** Large page title used on tab screens ("Find Donors", "Blood Requests"...). */
export function PageHeader({
  title,
  subtitle,
  right,
  below,
  bordered,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  below?: ReactNode;
  bordered?: boolean;
}) {
  return (
    <View style={[styles.pageHeader, bordered && styles.bordered]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
          {typeof subtitle === 'string' ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : subtitle}
        </View>
        {right && <View style={styles.right}>{right}</View>}
      </View>
      {below}
    </View>
  );
}

/** Square white header button (settings gear, bell...). */
export function HeaderIconButton({
  children,
  onPress,
  label,
  style,
  tone = 'white',
}: {
  children: ReactNode;
  onPress: () => void;
  label: string;
  style?: StyleProp<ViewStyle>;
  tone?: 'white' | 'grey' | 'pink' | 'red';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'white' && styles.iconWhite,
        tone === 'grey' && styles.iconGrey,
        tone === 'pink' && styles.iconPink,
        tone === 'red' && styles.iconRed,
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

/** Back-button header for stacked screens. */
export function StackHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={styles.stackHeader}>
      <HeaderIconButton label="Go back" onPress={back} tone="white">
        <ChevronLeft size={22} color={Colors.text} strokeWidth={2.4} />
      </HeaderIconButton>
      <View style={{ flex: 1 }}>
        <Text style={styles.stackTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.stackSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: { paddingHorizontal: SCREEN_PADDING, paddingTop: 14, paddingBottom: 14, gap: 14 },
  bordered: { borderBottomWidth: 1, borderBottomColor: Colors.divider, backgroundColor: Colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 15, color: Colors.textMuted, marginTop: 4 },
  iconButton: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconWhite: { backgroundColor: Colors.surface, ...Shadows.soft, borderWidth: 1, borderColor: Colors.border },
  iconGrey: { backgroundColor: '#F1F3F7' },
  iconPink: { backgroundColor: Colors.primarySoft, borderWidth: 1.5, borderColor: Colors.primaryBorder },
  iconRed: { backgroundColor: Colors.primary, ...Shadows.primary },
  stackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 10,
    paddingBottom: 14,
  },
  stackTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  stackSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
});
