import { LinearGradient } from 'expo-linear-gradient';
import { Building2, HeartHandshake, ShieldCheck, Users, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { StackHeader } from '@/components/common/Headers';
import { IconTile } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { BloodDropIcon } from '@/components/icons';
import { Colors, Gradients } from '@/constants/colors';
import { Shadows } from '@/constants/theme';

const FEATURES = [
  { icon: Users, color: Colors.info, bg: Colors.infoSoft, title: 'Find Donors Nearby', text: 'Instantly connect with verified donors in your city with location-based matching.' },
  { icon: Zap, color: Colors.danger, bg: Colors.dangerSoft, title: 'Emergency Requests', text: 'Post urgent requests and alert matching donors in seconds.' },
  { icon: Building2, color: Colors.success, bg: Colors.successSoft, title: 'Partner Hospitals', text: 'Live blood inventory from 47+ partner hospitals across Pakistan.' },
  { icon: ShieldCheck, color: Colors.purple, bg: Colors.purpleSoft, title: 'Safe & Trusted', text: 'Verified donors, secure platform. Your health and safety is our top priority.' },
];

const STATS = [
  { value: '12K+', label: 'Donors' },
  { value: '47+', label: 'Hospitals' },
  { value: '30K+', label: 'Lives Saved' },
];

export default function About() {
  return (
    <Screen header={<StackHeader title="About LifeLink" />} contentStyle={{ gap: 16 }}>
      <LinearGradient colors={[Gradients.primary[0], Gradients.primary[1], Gradients.primary[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={[styles.ring, { width: 220, height: 220, top: -60, right: -60 }]} />
        <View style={styles.logo}>
          <BloodDropIcon size={40} color={Colors.white} accent="#D9566A" />
        </View>
        <Text style={styles.brand}>LifeLink</Text>
        <Text style={styles.tagline}>Connecting Donors. Saving Lives.</Text>
        <View style={styles.version}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </LinearGradient>

      <Card style={{ gap: 10 }}>
        <Text style={styles.title}>Our Mission</Text>
        <Text style={styles.text}>
          Every drop counts. LifeLink makes it simple for patients and families across Pakistan to find compatible blood donors quickly, and for donors to help when it matters most.
        </Text>
      </Card>

      <View style={styles.stats}>
        {STATS.map((s) => (
          <Card key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={{ gap: 16 }}>
        <Text style={styles.title}>What LifeLink Offers</Text>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.feature}>
            <IconTile icon={f.icon} color={f.color} bg={f.bg} size={48} iconSize={22} radius={15} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.footer}>
        <HeartHandshake size={22} color={Colors.primary} />
        <Text style={styles.footerText}>Made with ❤️ to save lives</Text>
        <Text style={styles.copyright}>© 2026 LifeLink · Karachi, Pakistan</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 30, alignItems: 'center', paddingVertical: 32, overflow: 'hidden', ...Shadows.primary },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 34, fontWeight: '800', color: Colors.white, marginTop: 14, letterSpacing: -0.8 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  version: { marginTop: 14, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, height: 30, borderRadius: 15, justifyContent: 'center' },
  versionText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text },
  text: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 6 },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  feature: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  featureText: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  footer: { alignItems: 'center', gap: 6, paddingVertical: 12 },
  footerText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  copyright: { fontSize: 12, color: Colors.textFaint },
});
