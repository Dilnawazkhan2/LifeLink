import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { initials } from '@/utils/format';

const TONES = [
  { bg: '#CCFBF1', text: '#0D9488' },
  { bg: '#CFFAFE', text: '#0891B2' },
  { bg: '#E0E7FF', text: '#4F46E5' },
  { bg: '#FCE7F3', text: '#DB2777' },
  { bg: '#FEF3C7', text: '#D97706' },
  { bg: '#DCFCE7', text: '#16A34A' },
];

const toneFor = (name: string) => {
  const sum = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return TONES[sum % TONES.length];
};

interface Props {
  name: string;
  size?: number;
  uri?: string;
  /** Override palette (profile uses pink) */
  tone?: { bg: string; text: string };
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name, size = 52, uri, tone, ringColor, style }: Props) {
  const t = tone ?? toneFor(name);
  const ring = ringColor ? { borderWidth: Math.max(2, size * 0.05), borderColor: ringColor } : null;
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg },
        ring,
        style,
      ]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: size / 2 }} contentFit="cover" />
      ) : (
        <Text style={[styles.text, { color: t.text, fontSize: size * 0.36 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { fontWeight: '800', letterSpacing: 0.5 },
});
