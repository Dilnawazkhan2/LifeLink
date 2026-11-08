import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { SCREEN_PADDING, TAB_BAR_HEIGHT } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  /** Rendered above the scroll area (fixed headers) */
  header?: ReactNode;
  /** Rendered below the scroll area (fixed footers / composers) */
  footer?: ReactNode;
  scroll?: boolean;
  /** Adds bottom space so content clears the floating tab bar */
  withTabBar?: boolean;
  keyboard?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  background?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Apply the top safe-area inset (false when a header already handles it) */
  safeTop?: boolean;
}

export function Screen({
  children,
  header,
  footer,
  scroll = true,
  withTabBar = false,
  keyboard = false,
  padded = true,
  contentStyle,
  background = Colors.background,
  refreshing,
  onRefresh,
  safeTop = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomSpace = withTabBar ? TAB_BAR_HEIGHT + insets.bottom + 28 : footer ? 16 : insets.bottom + 24;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padded && styles.padded, { paddingBottom: bottomSpace }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        ) : undefined
      }>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>{children}</View>
  );

  const inner = (
    <>
      {header}
      {body}
      {footer}
    </>
  );

  return (
    <View style={[styles.flex, { backgroundColor: background, paddingTop: safeTop ? insets.top : 0 }]}>
      {keyboard ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: SCREEN_PADDING },
});
