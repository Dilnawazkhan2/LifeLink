import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { CircleUserRound, House, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BloodDropIcon, HomeFilledIcon, MedicalIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';
import { Shadows, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useStats } from '@/store/AppStore';

const LABELS: Record<string, string> = {
  index: 'Home',
  donors: 'Donors',
  requests: 'Requests',
  hospitals: 'Hospitals',
  profile: 'Profile',
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  switch (name) {
    case 'index':
      return focused ? <HomeFilledIcon size={29} color={color} /> : <House size={28} color={color} strokeWidth={1.7} />;
    case 'donors':
      return <Users size={28} color={color} fill={focused ? color : 'transparent'} strokeWidth={focused ? 2.2 : 1.7} />;
    case 'hospitals':
      return <MedicalIcon size={27} color={color} variant={focused ? 'filled' : 'outline'} strokeWidth={1.5} />;
    case 'profile':
      return focused ? (
        <View style={[styles.profileFilled, { backgroundColor: color }]}>
          <CircleUserRound size={30} color={Colors.white} strokeWidth={1.8} />
        </View>
      ) : (
        <CircleUserRound size={29} color={color} strokeWidth={1.7} />
      );
    default:
      return null;
  }
}

/** Custom 5-tab bar with the elevated centre "Requests" blood-drop button. */
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { unread } = useStats();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: TAB_BAR_HEIGHT + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const isCenter = route.name === 'requests';
        const color = focused ? Colors.primary : Colors.textMuted;
        const label = LABELS[route.name] ?? route.name;

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };

        if (isCenter) {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}>
              <View style={styles.centerButton}>
                <BloodDropIcon size={30} variant={focused ? 'filled' : 'outline'} color={Colors.white} accent={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.label, { color: Colors.primary, marginTop: 4 }]}>{label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}>
            <View>
              <TabIcon name={route.name} focused={focused} color={color} />
              {route.name === 'profile' && unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Shadows.soft,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9, gap: 5 },
  label: { fontSize: 13, fontWeight: '600' },
  centerButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    borderWidth: 4,
    borderColor: Colors.surface,
    ...Shadows.primary,
  },
  profileFilled: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -8,
    right: -14,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});
