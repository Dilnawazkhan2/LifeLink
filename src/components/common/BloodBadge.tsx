import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BloodGroupTones } from '@/constants/bloodGroups';
import type { BloodGroup } from '@/types';

const SIZES = {
  sm: { w: 44, h: 34, font: 15, radius: 10 },
  card: { w: 48, h: 38, font: 17, radius: 10 },
  md: { w: 64, h: 50, font: 20, radius: 12 },
  lg: { w: 72, h: 72, font: 22, radius: 20 },
} as const;

interface Props {
  group: BloodGroup;
  size?: keyof typeof SIZES;
  style?: StyleProp<ViewStyle>;
}

/** Rounded blood-group tile (e.g. the "O-" box on donor cards). */
export function BloodBadge({ group, size = 'md', style }: Props) {
  const tone = BloodGroupTones[group];
  const s = SIZES[size];
  return (
    <View
      accessibilityLabel={`Blood group ${group}`}
      style={[
        styles.base,
        { width: s.w, height: s.h, borderRadius: s.radius, backgroundColor: tone.bg, borderColor: tone.border },
        style,
      ]}>
      <Text style={[styles.text, { color: tone.text, fontSize: s.font }]}>{group}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  text: { fontWeight: '800' },
});
