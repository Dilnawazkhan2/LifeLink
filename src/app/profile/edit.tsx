import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Mail, MapPin, Phone, Trash2, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Chip, ChipRow } from '@/components/common/Chip';
import { useFeedback } from '@/components/common/Feedback';
import { StackHeader } from '@/components/common/Headers';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/forms/TextField';
import { Colors } from '@/constants/colors';
import { useApp } from '@/store/AppStore';
import { BLOOD_GROUPS, CITIES, type AccountRole, type BloodGroup, type City } from '@/types';
import { validateEmail, validatePhone, validateRequired } from '@/utils/validation';

const ROLES: { key: AccountRole; label: string }[] = [
  { key: 'both', label: 'Donor & Recipient' },
  { key: 'donor', label: 'Donor' },
  { key: 'recipient', label: 'Recipient' },
];

type Field = 'name' | 'email' | 'phone' | 'area' | 'age' | 'weight' | 'bloodGroup' | 'city';

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const { state, actions } = useApp();
  const { toast, confirm } = useFeedback();
  const u = state.user;

  const [name, setName] = useState(u.name);
  const [email, setEmail] = useState(u.email);
  const [phone, setPhone] = useState(u.phone);
  // No blood group on record (e.g. website sign-up): start unselected instead of a placeholder value.
  const initialGroup = u.bloodGroupMissing ? undefined : u.bloodGroup;
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | undefined>(initialGroup);
  const [city, setCity] = useState<City>(u.city);
  const [area, setArea] = useState(u.area);
  const [role, setRole] = useState<AccountRole>(u.role);
  const [age, setAge] = useState(String(u.age));
  const [weight, setWeight] = useState(String(u.weightKg));
  const [gender, setGender] = useState(u.gender);
  const [avatarUri, setAvatarUri] = useState(u.avatarUri);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);

  const dirty =
    name !== u.name ||
    email !== u.email ||
    phone !== u.phone ||
    bloodGroup !== initialGroup ||
    city !== u.city ||
    area !== u.area ||
    role !== u.role ||
    age !== String(u.age) ||
    weight !== String(u.weightKg) ||
    gender !== u.gender ||
    avatarUri !== u.avatarUri;

  const back = () => {
    if (!dirty) return router.back();
    confirm({
      title: 'Discard changes?',
      message: 'Your profile edits have not been saved.',
      confirmLabel: 'Discard',
      destructive: true,
      onConfirm: () => router.back(),
    });
  };

  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return toast('Photo library permission is required', 'error');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!res.canceled && res.assets[0]) setAvatarUri(res.assets[0].uri);
    } catch {
      toast('Could not open photo library', 'error');
    }
  };

  const save = async () => {
    const ageNum = Number(age);
    const weightNum = Number(weight);
    const next: Partial<Record<Field, string>> = {
      name: validateRequired(name, 'Full name'),
      email: validateEmail(email),
      phone: validatePhone(phone),
      area: validateRequired(area, 'Area'),
      age: !Number.isInteger(ageNum) || ageNum < 17 || ageNum > 65 ? 'Donors must be 17–65 years old' : undefined,
      weight: !Number.isFinite(weightNum) || weightNum < 50 || weightNum > 200 ? 'Minimum weight to donate is 50 kg' : undefined,
      // Donor accounts need both to be listed in donor search.
      bloodGroup: role !== 'recipient' && !bloodGroup ? 'Select your blood group' : undefined,
      city: role !== 'recipient' && !city ? 'Select your city' : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSaving(true);
    if (state.mode === 'demo') await new Promise((r) => setTimeout(r, 500)); // simulated latency in demo mode
    {
      const ok = await actions.updateUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(bloodGroup ? { bloodGroup, bloodGroupMissing: false } : {}),
        city,
        area: area.trim(),
        role,
        age: ageNum,
        weightKg: weightNum,
        gender,
        avatarUri,
      });
      setSaving(false);
      if (!ok) return; // error toast shown by the store
      toast('Profile updated');
      router.back();
    }
  };

  const field = (f: Field, setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (errors[f]) setErrors((e) => ({ ...e, [f]: undefined }));
  };

  return (
    <Screen
      keyboard
      header={<StackHeader title="Edit Profile" subtitle="Update your information" onBack={back} />}
      footer={
        <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Button label="Cancel" variant="soft" color={Colors.textSecondary} onPress={back} style={{ flex: 1 }} />
          <Button label="Save Changes" loading={saving} disabled={!dirty} onPress={save} style={{ flex: 1.6 }} />
        </View>
      }
      contentStyle={{ gap: 16 }}>
      <Card style={styles.avatarCard}>
        <View>
          <Avatar name={name || u.name} uri={avatarUri} size={104} tone={{ bg: '#FCE7F3', text: '#E11D74' }} ringColor={Colors.primary} />
          <Pressable onPress={pickPhoto} style={styles.camera} accessibilityLabel="Change photo">
            <Camera size={18} color={Colors.white} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Change Photo" variant="soft" size="sm" fullWidth={false} onPress={pickPhoto} />
          {avatarUri && (
            <Button
              label="Remove"
              variant="soft"
              size="sm"
              color={Colors.textSecondary}
              fullWidth={false}
              icon={<Trash2 size={15} color={Colors.textSecondary} />}
              onPress={() => setAvatarUri(undefined)}
            />
          )}
        </View>
      </Card>

      <Card style={{ gap: 18 }}>
        <Text style={styles.section}>Personal Information</Text>
        <TextField label="Full Name" icon={User} value={name} onChangeText={field('name', setName)} error={errors.name} autoCapitalize="words" />
        <TextField label="Email Address" icon={Mail} value={email} onChangeText={field('email', setEmail)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
        <TextField label="Phone Number" icon={Phone} value={phone} onChangeText={field('phone', setPhone)} error={errors.phone} keyboardType="phone-pad" />
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <TextField label="Age" value={age} onChangeText={field('age', setAge)} error={errors.age} keyboardType="number-pad" maxLength={2} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Weight (kg)" value={weight} onChangeText={field('weight', setWeight)} error={errors.weight} keyboardType="number-pad" maxLength={3} />
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Gender</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['Male', 'Female'] as const).map((g) => (
              <Chip key={g} label={g} active={gender === g} onPress={() => setGender(g)} />
            ))}
          </View>
        </View>
      </Card>

      <Card style={{ gap: 18 }}>
        <Text style={styles.section}>Donor Details</Text>
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Blood Group</Text>
          <View style={styles.wrap}>
            {BLOOD_GROUPS.map((g) => (
              <Chip key={g} label={g} active={bloodGroup === g} onPress={() => { setBloodGroup(g); setErrors((e) => ({ ...e, bloodGroup: undefined })); }} />
            ))}
          </View>
          {errors.bloodGroup && <Text style={styles.error}>{errors.bloodGroup}</Text>}
        </View>
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Account Role</Text>
          <View style={styles.wrap}>
            {ROLES.map((r) => (
              <Chip key={r.key} label={r.label} active={role === r.key} onPress={() => setRole(r.key)} />
            ))}
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Text style={styles.label}>City</Text>
          <ChipRow style={{ marginHorizontal: -18 }}>
            {CITIES.map((c) => (
              <Chip key={c} label={c} active={city === c} onPress={() => { setCity(c); setErrors((e) => ({ ...e, city: undefined })); }} />
            ))}
          </ChipRow>
          {errors.city && <Text style={styles.error}>{errors.city}</Text>}
        </View>
        <TextField label="Area" icon={MapPin} value={area} onChangeText={field('area', setArea)} error={errors.area} placeholder="e.g. DHA Phase 6" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarCard: { alignItems: 'center', gap: 16, paddingVertical: 24 },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { fontSize: 18, fontWeight: '800', color: Colors.text },
  label: { fontSize: 15, fontWeight: '600', color: '#334155' },
  error: { fontSize: 13, color: Colors.danger },
  twoCol: { flexDirection: 'row', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
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
