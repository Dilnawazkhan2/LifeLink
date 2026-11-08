import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { BloodDropIcon } from '@/components/icons';
import { Colors, Gradients } from '@/constants/colors';

/** Red gradient brand header used by the login & forgot-password screens. */
export function AuthHero({ topInset, compact }: { topInset: number; compact?: boolean }) {
  return (
    <LinearGradient
      colors={[Gradients.primary[0], Gradients.primary[1], Gradients.primary[2]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: topInset + (compact ? 20 : 40), paddingBottom: compact ? 64 : 76 }]}>
      {/* decorative rings */}
      <View style={[styles.ring, { width: 260, height: 260, top: -10, right: -90 }]} />
      <View style={[styles.ring, { width: 180, height: 180, top: 30, right: -50 }]} />
      <View style={[styles.ring, { width: 220, height: 220, bottom: -120, left: -100 }]} />
      <View style={[styles.spark, { top: topInset + 30, left: 40 }]} />
      <View style={[styles.spark, { bottom: 40, right: 50, width: 4, height: 4 }]} />

      <View style={styles.logoOuter}>
        <View style={styles.logoInner}>
          <BloodDropIcon size={30} color={Colors.white} accent="#D9566A" />
        </View>
      </View>
      <Text style={styles.brand}>LifeLink</Text>
      <View style={styles.taglineRow}>
        <View style={styles.tagDot} />
        <Text style={styles.tagline}>Connecting donors · saving lives</Text>
        <View style={styles.tagDot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', overflow: 'hidden' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  spark: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  logoOuter: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 40, fontWeight: '800', color: Colors.white, marginTop: 20, letterSpacing: -1 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  tagDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.88)', letterSpacing: 0.4 },
});
