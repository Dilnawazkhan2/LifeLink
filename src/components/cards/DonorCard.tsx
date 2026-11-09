import { BadgeCheck, Clock, MapPin, Navigation, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { BloodBadge } from '@/components/common/BloodBadge';
import { Card } from '@/components/common/Card';
import { BloodDropIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';
import type { Availability, Donor } from '@/types';
import { availabilityLabel, formatDistance, place } from '@/utils/format';

export const availabilityColor: Record<Availability, string> = {
  available: Colors.success,
  resting: Colors.warning,
  busy: Colors.danger,
};

export function DonorCard({ donor, onPress }: { donor: Donor; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`View ${donor.name}'s profile`}>
      <View style={styles.top}>
        <Avatar name={donor.name} size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {donor.name}
            </Text>
            {donor.verified && <BadgeCheck size={20} color={Colors.white} fill={Colors.info} />}
          </View>
          <View style={styles.metaRow}>
            <MapPin size={15} color={Colors.textMuted} />
            <Text style={styles.meta} numberOfLines={1}>
              {place(donor.area, donor.city)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.dot, { backgroundColor: availabilityColor[donor.availability] }]} />
            <Text style={[styles.status, { color: availabilityColor[donor.availability] }]}>
              {availabilityLabel[donor.availability]}
            </Text>
          </View>
        </View>
        <BloodBadge group={donor.bloodGroup} size="card" style={{ alignSelf: 'flex-start' }} />
      </View>

      <View style={styles.stats}>
        <Stat icon={<BloodDropIcon size={17} color={Colors.primary} accent={Colors.primary} />} value={String(donor.donations)} label="Donations" />
        <View style={styles.sep} />
        <Stat icon={<Star size={18} color={Colors.warning} fill={Colors.warning} />} value={donor.rating.toFixed(1)} label="Rating" />
        <View style={styles.sep} />
        <Stat icon={<Navigation size={17} color={Colors.info} style={{ transform: [{ rotate: '0deg' }] }} />} value={formatDistance(donor.distanceKm)} label="Away" />
        <View style={styles.sep} />
        <Stat icon={<Clock size={17} color={Colors.textMuted} />} value={donor.hours} label="Hours" />
      </View>
    </Card>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 14 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.text, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 15, color: Colors.textMuted, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontSize: 15, fontWeight: '600' },
  stats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: 12, color: Colors.textMuted },
  sep: { width: 1, backgroundColor: Colors.divider, marginVertical: 14 },
});
