import { Building2, CircleAlert, Clock, MapPin, Navigation, ShieldCheck, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { IconTile, Pill } from '@/components/common/Misc';
import { BloodDropIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';
import type { BloodGroup, Hospital } from '@/types';
import { BLOOD_GROUPS } from '@/types';
import { formatCount, formatDistance } from '@/utils/format';

export type StockLevel = 'good' | 'low' | 'critical';

export const stockLevel = (units: number): StockLevel => (units <= 2 ? 'critical' : units <= 6 ? 'low' : 'good');
export const stockColor: Record<StockLevel, string> = {
  good: Colors.success,
  low: Colors.warning,
  critical: Colors.danger,
};

export const criticalGroups = (h: Hospital): BloodGroup[] =>
  BLOOD_GROUPS.filter((g) => stockLevel(h.inventory[g]) === 'critical');

export function HospitalCard({ hospital, onPress }: { hospital: Hospital; onPress: () => void }) {
  const critical = criticalGroups(hospital);
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`View ${hospital.name}`}>
      <View style={styles.top}>
        <IconTile icon={Building2} color={Colors.primary} bg={Colors.primarySoft} size={64} iconSize={30} radius={18} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={styles.name}>{hospital.name}</Text>
          <View style={styles.tags}>
            <Pill label={hospital.type === 'Semi-Government' ? 'Semi-Gov' : hospital.type} color={Colors.primary} bg={Colors.primarySoft} />
            {hospital.hasBloodBank && (
              <Pill
                label="Blood Bank"
                color={Colors.primary}
                bg={Colors.primarySoft}
                icon={<BloodDropIcon size={12} color={Colors.primary} accent={Colors.primarySoft} />}
              />
            )}
          </View>
        </View>
        {hospital.verified && <ShieldCheck size={26} color={Colors.white} fill={Colors.info} />}
      </View>

      <View style={styles.row}>
        <MapPin size={17} color={Colors.textMuted} />
        <Text style={styles.address} numberOfLines={1}>
          {hospital.address}
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.row}>
          <Star size={18} color={Colors.warning} fill={Colors.warning} />
          <Text style={styles.metricValue}>{hospital.rating}</Text>
          <Text style={styles.metricMuted}>({formatCount(hospital.reviews)})</Text>
        </View>
        <View style={styles.row}>
          <Navigation size={17} color={Colors.info} />
          <Text style={styles.metricValue}>{formatDistance(hospital.distanceKm)}</Text>
        </View>
        <View style={styles.row}>
          <Clock size={17} color={Colors.success} />
          <Text style={styles.metricValue}>{hospital.open24h ? '24/7' : '8 AM – 8 PM'}</Text>
        </View>
      </View>

      {critical.length > 0 && (
        <View style={styles.warning}>
          <CircleAlert size={18} color={Colors.white} fill={Colors.danger} />
          <Text style={styles.warningText}>Critically low: {critical.join(', ')}</Text>
        </View>
      )}

      <InventoryDots hospital={hospital} groups={BLOOD_GROUPS.slice(0, 4)} />
    </Card>
  );
}

export function InventoryDots({ hospital, groups }: { hospital: Hospital; groups: readonly BloodGroup[] }) {
  return (
    <View style={styles.dots}>
      {groups.map((g) => (
        <View key={g} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: stockColor[stockLevel(hospital.inventory[g])] }]} />
          <Text style={styles.dotLabel}>{g}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  top: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  name: { fontSize: 18, fontWeight: '700', color: Colors.text, lineHeight: 24 },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: { fontSize: 15, color: Colors.textMuted, flex: 1 },
  metrics: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  metricValue: { fontSize: 17, fontWeight: '600', color: Colors.text },
  metricMuted: { fontSize: 14, color: Colors.textMuted },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  warningText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  dotLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
