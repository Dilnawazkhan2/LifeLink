import { Award, CircleHelp, Droplet, Heart, Lock, Shield, Star, Trophy, Zap, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import type { Badge } from '@/types';
import { formatMonthDayYear } from '@/utils/date';

const ICONS: Record<Badge['icon'], LucideIcon> = {
  shield: Shield,
  help: CircleHelp,
  droplet: Droplet,
  award: Award,
  heart: Heart,
  zap: Zap,
  star: Star,
  trophy: Trophy,
};

export const BADGE_TONES: Record<Badge['tone'], { main: string; bg: string; circle: string; border: string }> = {
  blue: { main: '#3B82F6', bg: '#F5F9FF', circle: '#DBEAFE', border: '#DBEAFE' },
  green: { main: '#10B981', bg: '#F3FCF8', circle: '#D1FAE5', border: '#CDEFE0' },
  red: { main: '#C41E3A', bg: '#FFF7F8', circle: '#FFE4E6', border: '#FECDD3' },
  amber: { main: '#F59E0B', bg: '#FFFCF3', circle: '#FEF3C7', border: '#FDE68A' },
  purple: { main: '#8B5CF6', bg: '#FAF8FF', circle: '#EDE9FE', border: '#DDD6FE' },
};

export function BadgeCard({ badge, style }: { badge: Badge; style?: StyleProp<ViewStyle> }) {
  const earned = !!badge.earnedAt;
  const tone = BADGE_TONES[badge.tone];
  const Icon = ICONS[badge.icon];
  return (
    <View
      style={[
        styles.card,
        earned ? { backgroundColor: tone.bg, borderColor: tone.border } : styles.locked,
        style,
      ]}>
      <View style={[styles.circle, { backgroundColor: earned ? tone.circle : '#F1F5F9' }]}>
        {badge.icon === 'help' ? (
          <Text style={{ fontSize: 40, color: earned ? tone.main : Colors.textMuted }}>?</Text>
        ) : (
          <Icon size={36} color={earned ? tone.main : Colors.textMuted} fill={earned && badge.icon === 'shield' ? tone.main : 'transparent'} />
        )}
        {!earned && (
          <View style={styles.lock}>
            <Lock size={12} color={Colors.white} />
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: earned ? tone.main : Colors.textSecondary }]}>{badge.title}</Text>
      <Text style={styles.desc}>{badge.description}</Text>
      {earned ? (
        <Text style={styles.date}>{formatMonthDayYear(badge.earnedAt ?? '')}</Text>
      ) : (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round((badge.progress ?? 0) * 100)}%`, backgroundColor: tone.main }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 154,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  locked: { backgroundColor: '#FAFBFC', borderColor: Colors.border },
  circle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  lock: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textMuted,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  date: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', marginTop: 4 },
  progressTrack: { height: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: '#E2E8F0', marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
});
