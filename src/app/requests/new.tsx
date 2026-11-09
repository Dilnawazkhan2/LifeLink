import { router, useLocalSearchParams } from 'expo-router';
import { Building2, CircleCheck, FileText, MapPin, Minus, Phone, Plus, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Chip, ChipRow } from '@/components/common/Chip';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { IconTile } from '@/components/common/Misc';
import { Screen } from '@/components/common/Screen';
import { CircleAlertBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { Colors } from '@/constants/colors';
import { BloodGroupTones } from '@/constants/bloodGroups';
import { useApp } from '@/store/AppStore';
import { BLOOD_GROUPS, CITIES, type BloodGroup, type BloodRequest, type City, type Urgency } from '@/types';
import { validatePhone, validateRequired } from '@/utils/validation';

const URGENCY: { key: Urgency; label: string; hint: string; color: string; bg: string }[] = [
  { key: 'critical', label: 'Critical', hint: 'Life-threatening emergency', color: '#EF4444', bg: '#FEF2F2' },
  { key: 'urgent', label: 'Urgent', hint: 'Needed within 24 hours', color: '#F97316', bg: '#FFF7ED' },
  { key: 'normal', label: 'Normal', hint: 'Can wait a few days', color: '#3B82F6', bg: '#EFF6FF' },
];

type Field = 'patientName' | 'bloodGroup' | 'hospitalName' | 'area' | 'contactName' | 'contactPhone' | 'description';

const isBloodGroup = (v: unknown): v is BloodGroup => typeof v === 'string' && (BLOOD_GROUPS as readonly string[]).includes(v);
const isCity = (v: unknown): v is City => typeof v === 'string' && (CITIES as readonly string[]).includes(v);
const isUrgency = (v: unknown): v is Urgency => v === 'critical' || v === 'urgent' || v === 'normal';

export default function NewRequest() {
  const params = useLocalSearchParams<{ bloodGroup?: string; urgency?: string; hospital?: string; hospitalId?: string; city?: string; address?: string }>();
  const insets = useSafeAreaInsets();
  const { state, actions } = useApp();
  const { confirm } = useFeedback();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | undefined>(isBloodGroup(params.bloodGroup) ? params.bloodGroup : undefined);
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>(isUrgency(params.urgency) ? params.urgency : 'urgent');
  const [hospitalName, setHospitalName] = useState(params.hospital ?? '');
  const [city, setCity] = useState<City>(isCity(params.city) ? params.city : state.user.city);
  const [area, setArea] = useState(params.address ?? '');
  const [contactName, setContactName] = useState(state.user.name);
  const [contactPhone, setContactPhone] = useState(state.user.phone);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<BloodRequest>();

  const clear = (f: Field) => errors[f] && setErrors((e) => ({ ...e, [f]: undefined }));

  const dirty = !!(patientName || description || (hospitalName && !params.hospital));
  const close = () => {
    if (!dirty || created) return router.back();
    confirm({
      title: 'Discard request?',
      message: 'You have unsaved details. Leaving now will discard them.',
      confirmLabel: 'Discard',
      destructive: true,
      onConfirm: () => router.back(),
    });
  };

  const submit = async () => {
    const next: Partial<Record<Field, string>> = {
      patientName: validateRequired(patientName, 'Patient name'),
      bloodGroup: bloodGroup ? undefined : 'Select the required blood group',
      hospitalName: validateRequired(hospitalName, 'Hospital name'),
      area: validateRequired(area, 'Hospital address'),
      contactName: validateRequired(contactName, 'Contact name'),
      contactPhone: validatePhone(contactPhone),
      description: description.trim().length < 10 ? 'Please add a few details (min. 10 characters)' : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean) || !bloodGroup) return;

    setSubmitting(true);
    if (state.mode === 'demo') await new Promise((r) => setTimeout(r, 700)); // simulated latency in demo mode
    {
      const request = await actions.createRequest({
        patientName: patientName.trim(),
        bloodGroup,
        units,
        urgency,
        hospitalName: hospitalName.trim(),
        hospitalId: params.hospitalId,
        area: area.trim(),
        city,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        description: description.trim(),
      });
      setSubmitting(false);
      if (request) setCreated(request); // errors are shown as a toast by the store
    }
  };

  if (created) {
    return (
      <Screen header={<StackHeader title="Request Posted" onBack={() => router.back()} />} contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.success}>
          <IconTile icon={CircleCheck} color={Colors.success} bg={Colors.successSoft} size={96} radius={32} iconSize={46} />
          <Text style={styles.successTitle}>{created.status === 'pending' ? 'Request Submitted!' : 'Request Posted!'}</Text>
          <Text style={styles.successText}>
            {created.status === 'pending'
              ? `Your request${created.referenceCode ? ` (${created.referenceCode})` : ''} was sent to the LifeLink team for a quick review. Compatible ${created.bloodGroup} donors will be notified as soon as it is approved.`
              : `Your blood request is now live. Nearby ${created.bloodGroup} donors within ${state.settings.searchRadiusKm} km will be notified.`}
          </Text>
          <Button label="View Request" onPress={() => router.replace(`/requests/${created.id}`)} style={{ marginTop: 16 }} />
          <Button label="Back to Requests" variant="soft" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <Screen
      keyboard
      header={<StackHeader title="Create Blood Request" subtitle="Fill in the details to find donors nearby" onBack={close} />}
      footer={
        <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Button label="Post Blood Request" loading={submitting} size="lg" onPress={submit} />
        </View>
      }
      contentStyle={{ gap: 16 }}>
      {hasErrors && <CircleAlertBanner message="Please fix the highlighted fields before posting." />}

      <Card style={{ gap: 18 }}>
        <Text style={styles.section}>Patient Information</Text>
        <TextField
          label="Patient Name"
          icon={User}
          placeholder="e.g. Ahmed Khan"
          value={patientName}
          onChangeText={(v) => {
            setPatientName(v);
            clear('patientName');
          }}
          error={errors.patientName}
          autoCapitalize="words"
        />

        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Blood Group Required</Text>
          <View style={styles.groupGrid}>
            {BLOOD_GROUPS.map((g) => {
              const active = bloodGroup === g;
              const tone = BloodGroupTones[g];
              return (
                <Pressable
                  key={g}
                  onPress={() => {
                    setBloodGroup(g);
                    clear('bloodGroup');
                  }}
                  style={[styles.groupItem, active ? { backgroundColor: tone.text, borderColor: tone.text } : { backgroundColor: tone.bg, borderColor: tone.border }]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Blood group ${g}`}>
                  <Text style={[styles.groupText, { color: active ? Colors.white : tone.text }]}>{g}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.bloodGroup && <Text style={styles.error}>{errors.bloodGroup}</Text>}
        </View>

        <View style={styles.unitsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Units Required</Text>
            <Text style={styles.hint}>1 unit ≈ 450 ml (max 10)</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable onPress={() => setUnits((u) => Math.max(1, u - 1))} style={styles.stepBtn} accessibilityLabel="Decrease units" disabled={units <= 1}>
              <Minus size={18} color={units <= 1 ? Colors.textFaint : Colors.primary} />
            </Pressable>
            <Text style={styles.units}>{units}</Text>
            <Pressable onPress={() => setUnits((u) => Math.min(10, u + 1))} style={styles.stepBtn} accessibilityLabel="Increase units" disabled={units >= 10}>
              <Plus size={18} color={units >= 10 ? Colors.textFaint : Colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Urgency Level</Text>
          {URGENCY.map((u) => {
            const active = urgency === u.key;
            return (
              <Pressable
                key={u.key}
                onPress={() => setUrgency(u.key)}
                style={[styles.urgency, active && { borderColor: u.color, backgroundColor: u.bg }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}>
                <View style={[styles.radio, active && { borderColor: u.color }]}>{active && <View style={[styles.radioDot, { backgroundColor: u.color }]} />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.urgencyLabel, active && { color: u.color }]}>{u.label}</Text>
                  <Text style={styles.hint}>{u.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: 18 }}>
        <Text style={styles.section}>Hospital Information</Text>
        <TextField
          label="Hospital Name"
          icon={Building2}
          placeholder="e.g. Services Hospital"
          value={hospitalName}
          onChangeText={(v) => {
            setHospitalName(v);
            clear('hospitalName');
          }}
          error={errors.hospitalName}
        />
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>City</Text>
          <ChipRow style={{ marginHorizontal: -18 }}>
            {CITIES.map((c) => (
              <Chip key={c} label={c} active={city === c} onPress={() => setCity(c)} />
            ))}
          </ChipRow>
        </View>
        <TextField
          label="Hospital Address / Area"
          icon={MapPin}
          placeholder="e.g. Jail Road, Lahore"
          value={area}
          onChangeText={(v) => {
            setArea(v);
            clear('area');
          }}
          error={errors.area}
        />
      </Card>

      <Card style={{ gap: 18 }}>
        <Text style={styles.section}>Contact & Details</Text>
        <TextField
          label="Contact Person"
          icon={User}
          value={contactName}
          onChangeText={(v) => {
            setContactName(v);
            clear('contactName');
          }}
          error={errors.contactName}
        />
        <TextField
          label="Phone Number"
          icon={Phone}
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={(v) => {
            setContactPhone(v);
            clear('contactPhone');
          }}
          error={errors.contactPhone}
        />
        <TextField
          label="Additional Notes"
          icon={FileText}
          multiline
          placeholder="Any specific requirements or information..."
          value={description}
          onChangeText={(v) => {
            setDescription(v);
            clear('description');
          }}
          error={errors.description}
          maxLength={300}
          hint={`${description.length}/300`}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 18, fontWeight: '800', color: Colors.text },
  label: { fontSize: 15, fontWeight: '600', color: '#334155' },
  hint: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  error: { fontSize: 13, color: Colors.danger, fontWeight: '500' },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  groupItem: { width: '22%', flexGrow: 1, height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  groupText: { fontSize: 17, fontWeight: '800' },
  unitsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.inputBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    padding: 4,
  },
  stepBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  units: { fontSize: 20, fontWeight: '800', color: Colors.text, minWidth: 30, textAlign: 'center' },
  urgency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: 16,
    padding: 14,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.textFaint, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  urgencyLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  footer: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.divider },
  success: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, marginTop: 8 },
  successText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 },
});
