import { Trophy } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { BadgeCard } from '@/components/cards/BadgeCard';
import { Card } from '@/components/common/Card';
import { StackHeader } from '@/components/common/Headers';
import { IconTile } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { Colors } from '@/constants/colors';
import { badges } from '@/data/badges';

export default function Badges() {
  const earned = badges.filter((b) => b.earnedAt);
  const locked = badges.filter((b) => !b.earnedAt);

  return (
    <Screen header={<StackHeader title="Badges & Achievements" subtitle={`${earned.length} of ${badges.length} earned`} />} contentStyle={{ gap: 18 }}>
      <Card style={styles.summary}>
        <IconTile icon={Trophy} color={Colors.warning} bg={Colors.warningSoft} size={60} radius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.summaryTitle}>
            {earned.length} badge{earned.length === 1 ? '' : 's'} earned
          </Text>
          <Text style={styles.summaryText}>Keep donating and responding to urgent requests to unlock more.</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(earned.length / badges.length) * 100}%` }]} />
          </View>
        </View>
      </Card>

      <Text style={styles.heading}>Earned</Text>
      <View style={styles.grid}>
        {earned.map((b) => (
          <BadgeCard key={b.id} badge={b} style={styles.cell} />
        ))}
      </View>

      <Text style={styles.heading}>Locked</Text>
      <View style={styles.grid}>
        {locked.map((b) => (
          <View key={b.id} style={styles.cell}>
            <BadgeCard badge={b} style={{ width: '100%' }} />
            <Text style={styles.requirement}>
              {b.requirement} · {Math.round((b.progress ?? 0) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  summaryText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#F1F5F9', overflow: 'hidden', marginTop: 4 },
  fill: { height: 8, borderRadius: 4, backgroundColor: Colors.warning },
  heading: { fontSize: 15, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47%', flexGrow: 1, gap: 6 },
  requirement: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 4 },
});
