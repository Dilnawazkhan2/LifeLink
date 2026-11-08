import { LinearGradient } from 'expo-linear-gradient';
import { Award, CalendarDays, CircleCheck, Droplets, FileText, Heart, Timer } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { EmptyState } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { BloodDropIcon } from '@/components/icons';
import { Colors, Gradients } from '@/constants/colors';
import { Shadows } from '@/constants/theme';
import { useApp, useEligibility } from '@/store/AppStore';
import { daysUntil, formatMonthDayYear, parseDate } from '@/utils/date';

export default function DonationHistory() {
  const { state } = useApp();
  const { eligible, nextEligible } = useEligibility();
  const { confirm } = useFeedback();
  const donations = [...state.donations].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  const totalUnits = donations.reduce((s, d) => s + d.units, 0);
  const firstYear = donations.length ? parseDate(donations[donations.length - 1].date).getFullYear() : new Date().getFullYear();

  // group by year
  const byYear = donations.reduce<Record<string, typeof donations>>((acc, d) => {
    const y = String(parseDate(d.date).getFullYear());
    (acc[y] ??= []).push(d);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <Screen header={<StackHeader title="Donation History" subtitle={`${donations.length} donations since ${firstYear}`} />} contentStyle={{ gap: 16 }}>
      <LinearGradient colors={[Gradients.primary[0], Gradients.primary[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}>
        <View style={styles.summaryItem}>
          <Droplets size={22} color={Colors.white} />
          <Text style={styles.summaryValue}>{donations.length}</Text>
          <Text style={styles.summaryLabel}>Donations</Text>
        </View>
        <View style={styles.sep} />
        <View style={styles.summaryItem}>
          <BloodDropIcon size={22} color={Colors.white} accent={Colors.primary} />
          <Text style={styles.summaryValue}>{(totalUnits * 0.45).toFixed(1)} L</Text>
          <Text style={styles.summaryLabel}>Blood Given</Text>
        </View>
        <View style={styles.sep} />
        <View style={styles.summaryItem}>
          <Heart size={22} color={Colors.white} fill={Colors.white} />
          <Text style={styles.summaryValue}>{state.user.livesSaved}</Text>
          <Text style={styles.summaryLabel}>Lives Saved</Text>
        </View>
      </LinearGradient>

      <View style={[styles.eligibility, !eligible && styles.notEligible]}>
        {eligible ? <CircleCheck size={22} color={Colors.white} fill={Colors.success} /> : <Timer size={22} color={Colors.warningDark} />}
        <Text style={[styles.eligibilityText, !eligible && { color: '#92400E' }]}>
          {eligible
            ? 'You are eligible to donate right now'
            : `Next eligible on ${formatMonthDayYear(nextEligible)} · ${daysUntil(parseDate(nextEligible))} days left`}
        </Text>
      </View>

      {donations.length === 0 ? (
        <EmptyState icon={Award} title="No Donations Yet" message="Accept a blood request to start your donation journey and save lives!" />
      ) : (
        years.map((y) => (
          <View key={y} style={{ gap: 10 }}>
            <Text style={styles.year}>{y}</Text>
            {byYear[y].map((d) => (
              <Card
                key={d.id}
                style={styles.item}
                onPress={() =>
                  confirm({
                    title: 'Donation Certificate',
                    message: `${d.hospitalName}, ${d.city}\n${formatMonthDayYear(d.date)} · ${d.units} unit · ${d.bloodGroup}\n\nCertificate No. ${d.certificateNo}`,
                    confirmLabel: 'Done',
                    hideCancel: true,
                    tone: 'success',
                    icon: FileText,
                  })
                }>
                <View style={styles.itemIcon}>
                  <BloodDropIcon size={20} color={Colors.white} accent={Colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {d.hospitalName}
                  </Text>
                  <View style={styles.row}>
                    <CalendarDays size={14} color={Colors.textMuted} />
                    <Text style={styles.itemMeta}>{formatMonthDayYear(d.date)}</Text>
                    <Text style={styles.itemMeta}>· {d.city}</Text>
                  </View>
                  <Text style={styles.cert}>#{d.certificateNo}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={styles.unitPill}>
                    <Text style={styles.unitText}>
                      {d.units} unit{d.units > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', borderRadius: 26, paddingVertical: 20, ...Shadows.primary },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 4 },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },
  sep: { width: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginVertical: 8 },
  eligibility: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.successSoft,
    borderWidth: 1.5,
    borderColor: Colors.successBorder,
    borderRadius: 16,
    padding: 14,
  },
  notEligible: { backgroundColor: Colors.warningSoft, borderColor: Colors.warningBorder },
  eligibilityText: { flex: 1, color: '#065F46', fontWeight: '600', fontSize: 14 },
  year: { fontSize: 15, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  itemIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  itemMeta: { fontSize: 13, color: Colors.textMuted },
  cert: { fontSize: 12, color: Colors.textFaint, fontWeight: '600' },
  unitPill: { backgroundColor: Colors.primarySoft, paddingHorizontal: 10, height: 28, borderRadius: 10, justifyContent: 'center' },
  unitText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  statusPill: { backgroundColor: Colors.successSoft, paddingHorizontal: 8, height: 22, borderRadius: 8, justifyContent: 'center' },
  statusText: { color: Colors.successDark, fontWeight: '700', fontSize: 11 },
});
