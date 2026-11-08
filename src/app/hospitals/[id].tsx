import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Bed, Building2, CircleAlert, Clock, MapPin, Navigation, Phone, ShieldCheck, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { criticalGroups, stockColor, stockLevel } from '@/components/cards/HospitalCard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { EmptyState, IconTile, InfoRow, Pill } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { BloodDropIcon } from '@/components/icons';
import { Colors } from '@/constants/colors';
import { hospitals } from '@/data/hospitals';
import { useApp } from '@/store/AppStore';
import { BLOOD_GROUPS } from '@/types';
import { formatCount, formatDistance } from '@/utils/format';

const LEVEL_LABEL = { good: 'Good', low: 'Low', critical: 'Critical' } as const;

export default function HospitalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const { contact, toast } = useFeedback();
  const hospital = hospitals.find((h) => h.id === id);

  if (!hospital) {
    return (
      <Screen header={<StackHeader title="Hospital Details" />}>
        <EmptyState icon={Building2} title="Hospital not found" message="This hospital is no longer listed." />
      </Screen>
    );
  }

  const critical = criticalGroups(hospital);
  const maxUnits = Math.max(...BLOOD_GROUPS.map((g) => hospital.inventory[g]), 1);
  const activeHere = state.requests.filter((r) => r.hospitalId === hospital.id && r.status === 'active');

  const directions = async () => {
    try {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name}, ${hospital.city}`)}`);
    } catch {
      toast('Could not open maps', 'error');
    }
  };

  return (
    <Screen
      header={<StackHeader title="Hospital Details" subtitle={hospital.city} />}
      footer={
        <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Button label="Directions" variant="outline" icon={<Navigation size={18} color={Colors.primary} />} onPress={directions} style={{ flex: 1 }} />
          <Button
            label="Call Hospital"
            icon={<Phone size={18} color={Colors.white} />}
            onPress={() => contact({ name: hospital.name, phone: hospital.phone, subtitle: hospital.phone })}
            style={{ flex: 1.3 }}
          />
        </View>
      }
      contentStyle={{ gap: 16 }}>
      <Card style={{ gap: 14 }}>
        <View style={styles.top}>
          <IconTile icon={Building2} color={Colors.primary} bg={Colors.primarySoft} size={68} iconSize={32} radius={20} />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.name}>{hospital.name}</Text>
            <View style={styles.tags}>
              <Pill label={hospital.type} color={Colors.primary} bg={Colors.primarySoft} />
              {hospital.hasBloodBank && (
                <Pill label="Blood Bank" color={Colors.primary} bg={Colors.primarySoft} icon={<BloodDropIcon size={12} color={Colors.primary} accent={Colors.primarySoft} />} />
              )}
              {hospital.verified && <Pill label="Verified" color={Colors.infoDark} bg={Colors.infoSoft} icon={<ShieldCheck size={13} color={Colors.infoDark} />} />}
            </View>
          </View>
        </View>
        <Text style={styles.about}>{hospital.about}</Text>
        <View style={styles.metrics}>
          <Metric icon={<Star size={18} color={Colors.warning} fill={Colors.warning} />} value={String(hospital.rating)} label={`${formatCount(hospital.reviews)} reviews`} />
          <Metric icon={<Navigation size={18} color={Colors.info} />} value={formatDistance(hospital.distanceKm)} label="Distance" />
          <Metric icon={<Clock size={18} color={Colors.success} />} value={hospital.open24h ? '24/7' : '8–8'} label="Open" />
          <Metric icon={<Bed size={18} color={Colors.purple} />} value={formatCount(hospital.beds)} label="Beds" />
        </View>
      </Card>

      <Card style={{ gap: 14 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Blood Inventory</Text>
          <Text style={styles.updated}>Updated 1h ago</Text>
        </View>
        {critical.length > 0 && (
          <View style={styles.warning}>
            <CircleAlert size={18} color={Colors.white} fill={Colors.danger} />
            <Text style={styles.warningText}>Critically low: {critical.join(', ')}</Text>
          </View>
        )}
        <View style={styles.grid}>
          {BLOOD_GROUPS.map((g) => {
            const units = hospital.inventory[g];
            const level = stockLevel(units);
            return (
              <View key={g} style={styles.invItem}>
                <View style={styles.invHead}>
                  <Text style={styles.invGroup}>{g}</Text>
                  <Text style={[styles.invLevel, { color: stockColor[level] }]}>{LEVEL_LABEL[level]}</Text>
                </View>
                <Text style={styles.invUnits}>{units} units</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.max(6, (units / maxUnits) * 100)}%`, backgroundColor: stockColor[level] }]} />
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          {(['good', 'low', 'critical'] as const).map((l) => (
            <View key={l} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: stockColor[l] }]} />
              <Text style={styles.legendText}>{LEVEL_LABEL[l]}</Text>
            </View>
          ))}
        </View>
      </Card>

      {activeHere.length > 0 && (
        <Card style={{ gap: 10 }}>
          <Text style={styles.cardTitle}>Active Requests Here</Text>
          {activeHere.map((r) => (
            <Button
              key={r.id}
              label={`${r.patientName} · ${r.bloodGroup} · ${r.units} units`}
              variant="soft"
              onPress={() => router.push(`/requests/${r.id}`)}
            />
          ))}
        </Card>
      )}

      <Card style={{ gap: 12 }}>
        <Text style={styles.cardTitle}>Services</Text>
        <View style={styles.tags}>
          {hospital.services.map((s) => (
            <Pill key={s} label={s} color={Colors.textSecondary} bg="#F1F5F9" style={{ height: 32, paddingHorizontal: 12 }} />
          ))}
        </View>
      </Card>

      <Card style={{ paddingVertical: 6 }}>
        <InfoRow icon={MapPin} iconColor={Colors.warning} iconBg={Colors.warningSoft} label="Address" value={hospital.address} />
        <InfoRow icon={Phone} iconColor={Colors.success} iconBg={Colors.successSoft} label="Phone" value={hospital.phone} last />
      </Card>

      <Button
        label="Request Blood at this Hospital"
        icon={<BloodDropIcon size={18} color={Colors.white} accent={Colors.primary} />}
        onPress={() => router.push({ pathname: '/requests/new', params: { hospital: hospital.name, hospitalId: hospital.id, city: hospital.city, address: hospital.address } })}
      />
    </Screen>
  );
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.metric}>
      {icon}
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: 14 },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text, lineHeight: 26 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  about: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  metrics: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 14 },
  metric: { flex: 1, alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 2 },
  metricLabel: { fontSize: 12, color: Colors.textMuted },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  updated: { fontSize: 13, color: Colors.textMuted },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.dangerSoft, borderRadius: 12, padding: 12 },
  warningText: { fontSize: 15, fontWeight: '600', color: Colors.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  invItem: { width: '48%', flexGrow: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, gap: 6 },
  invHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invGroup: { fontSize: 17, fontWeight: '800', color: Colors.text },
  invLevel: { fontSize: 12, fontWeight: '700' },
  invUnits: { fontSize: 13, color: Colors.textMuted },
  track: { height: 6, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 13, color: Colors.textSecondary },
  dot: { width: 10, height: 10, borderRadius: 5 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
});
