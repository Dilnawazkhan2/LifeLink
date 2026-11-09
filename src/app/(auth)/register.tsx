import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Lock, Mail, MailCheck, MapPin, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHero } from '@/components/common/AuthHero';
import { Button } from '@/components/common/Button';
import { Chip, ChipRow } from '@/components/common/Chip';
import { IconTile } from '@/components/common/Misc';
import { CircleAlertBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { Colors } from '@/constants/colors';
import * as auth from '@/services/auth';
import { useApp } from '@/store/AppStore';
import { BLOOD_GROUPS, CITIES, type AccountRole, type BloodGroup } from '@/types';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '@/utils/validation';

const ROLES: { key: AccountRole; label: string }[] = [
  { key: 'both', label: 'Donor & Recipient' },
  { key: 'donor', label: 'Donor' },
  { key: 'recipient', label: 'Recipient' },
];

type Field = 'name' | 'email' | 'phone' | 'password' | 'confirm' | 'bloodGroup' | 'area';

/** Create a LifeLink account (shared with the LifeLink website). */
export default function Register() {
  const insets = useSafeAreaInsets();
  const { actions } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>();
  const [city, setCity] = useState<string>('Karachi');
  const [area, setArea] = useState('');
  const [role, setRole] = useState<AccountRole>('both');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const field = (f: Field, setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (errors[f]) setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const submit = async () => {
    const next: Partial<Record<Field, string>> = {
      name: validateRequired(name, 'Full name'),
      email: validateEmail(email),
      phone: validatePhone(phone),
      password: validatePassword(password) ?? (password.length < 8 ? 'Use at least 8 characters' : undefined),
      confirm: confirmPw !== password ? 'Passwords do not match' : undefined,
      bloodGroup: role !== 'recipient' && !bloodGroup ? 'Select your blood group' : undefined,
      area: validateRequired(area, 'Area'),
    };
    setErrors(next);
    setFormError(undefined);
    if (Object.values(next).some(Boolean)) return;
    setLoading(true);
    const result = await auth.register({
      name, email, password, phone, city, area, role,
      bloodGroup: bloodGroup ?? 'O+',
    });
    setLoading(false);
    if (!result.ok) return setFormError(result.error);
    if (result.needsConfirmation) return setCheckEmail(true);
    actions.login();
    router.replace('/(tabs)');
  };

  if (checkEmail) {
    return (
      <View style={[styles.done, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <IconTile icon={MailCheck} color={Colors.success} bg={Colors.successSoft} size={96} radius={32} iconSize={46} />
        <Text style={styles.title}>Confirm your email</Text>
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>
          We sent a confirmation link to {email.trim()}. Open it, then sign in with your new account.
        </Text>
        <Button label="Back to Sign In" size="lg" onPress={() => router.replace('/login')} style={{ marginTop: 24, alignSelf: 'stretch' }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <AuthHero topInset={insets.top} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.grabber} />
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to sign in">
              <ArrowLeft size={20} color={Colors.text} />
            </Pressable>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join LifeLink and help save lives</Text>

            {formError && <CircleAlertBanner message={formError} />}

            <View style={{ gap: 18, marginTop: 24 }}>
              <TextField label="Full Name" icon={User} placeholder="Your full name" value={name} onChangeText={field('name', setName)} error={errors.name} autoCapitalize="words" autoComplete="name" />
              <TextField label="Email Address" icon={Mail} placeholder="you@example.com" value={email} onChangeText={field('email', setEmail)} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <TextField label="Phone Number" icon={Phone} placeholder="+92 300 1234567" value={phone} onChangeText={field('phone', setPhone)} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" />
              <TextField label="Password" icon={Lock} placeholder="At least 8 characters" password value={password} onChangeText={field('password', setPassword)} error={errors.password} autoCapitalize="none" autoComplete="new-password" />
              <TextField label="Confirm Password" icon={Lock} placeholder="Repeat your password" password value={confirmPw} onChangeText={field('confirm', setConfirmPw)} error={errors.confirm} autoCapitalize="none" />

              <View style={{ gap: 10 }}>
                <Text style={styles.label}>I want to</Text>
                <View style={styles.wrap}>
                  {ROLES.map((r) => (
                    <Chip key={r.key} label={r.label} active={role === r.key} onPress={() => setRole(r.key)} />
                  ))}
                </View>
              </View>

              <View style={{ gap: 10 }}>
                <Text style={styles.label}>Blood Group{role === 'recipient' ? ' (optional)' : ''}</Text>
                <View style={styles.wrap}>
                  {BLOOD_GROUPS.map((g) => (
                    <Chip key={g} label={g} active={bloodGroup === g} onPress={() => { setBloodGroup(g); setErrors((e) => ({ ...e, bloodGroup: undefined })); }} />
                  ))}
                </View>
                {errors.bloodGroup && <Text style={styles.error}>{errors.bloodGroup}</Text>}
              </View>

              <View style={{ gap: 10 }}>
                <Text style={styles.label}>City</Text>
                <ChipRow style={{ marginHorizontal: -28 }}>
                  {CITIES.map((c) => (
                    <Chip key={c} label={c} active={city === c} onPress={() => setCity(c)} />
                  ))}
                </ChipRow>
              </View>
              <TextField label="Area" icon={MapPin} placeholder="e.g. DHA Phase 6" value={area} onChangeText={field('area', setArea)} error={errors.area} />
            </View>

            <Button label="Create Account" size="lg" loading={loading} onPress={submit} style={styles.cta} />
            <Pressable onPress={() => router.replace('/login')} style={styles.switch} accessibilityRole="link">
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchLink}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primaryDark },
  sheet: {
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -36,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 18 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.textMuted, marginTop: 8, marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '600', color: '#334155' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  error: { fontSize: 13, color: Colors.danger },
  cta: { marginTop: 28, marginHorizontal: 32 },
  switch: { alignItems: 'center', marginTop: 18, paddingVertical: 8 },
  switchText: { fontSize: 15, color: Colors.textMuted },
  switchLink: { color: Colors.primary, fontWeight: '700' },
  done: { flex: 1, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
});
