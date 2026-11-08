import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Lock, Mail, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHero } from '@/components/common/AuthHero';
import { Button } from '@/components/common/Button';
import { CircleAlertBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { Colors } from '@/constants/colors';
import { DEMO_CREDENTIALS } from '@/data/user';
import * as auth from '@/services/auth';
import { useApp } from '@/store/AppStore';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function Login() {
  const insets = useSafeAreaInsets();
  const { actions } = useApp();
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (e = email, p = password) => {
    const next = { email: validateEmail(e), password: validatePassword(p) };
    setErrors(next);
    setFormError(undefined);
    if (next.email || next.password) return;
    setLoading(true);
    const result = await auth.login(e, p);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    actions.login();
    router.replace('/(tabs)');
  };

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    submit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}>
          <AuthHero topInset={insets.top} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.grabber} />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue saving lives</Text>

            {formError && <CircleAlertBanner message={formError} />}

            <View style={{ gap: 20, marginTop: 28 }}>
              <TextField
                label="Email Address"
                icon={Mail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                }}
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.email}
              />
              <TextField
                ref={passwordRef}
                label="Password"
                icon={Lock}
                placeholder="Your password"
                password
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="go"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
                }}
                onSubmitEditing={() => submit()}
                error={errors.password}
              />
            </View>

            <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} style={styles.forgot} accessibilityRole="link">
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Button label="Sign In" size="lg" loading={loading} onPress={() => submit()} style={styles.signIn} />

            <Pressable onPress={useDemo} disabled={loading} style={styles.demo} accessibilityRole="button">
              <Sparkles size={18} color={Colors.primary} />
              <Text style={styles.demoText}>Use Demo Account</Text>
            </Pressable>
            <Text style={styles.demoHint}>
              Demo: {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
            </Text>
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
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 30 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: Colors.textMuted, marginTop: 8, marginBottom: 4 },
  forgot: { alignSelf: 'flex-end', marginTop: 18 },
  forgotText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  signIn: { marginTop: 32, marginHorizontal: 32 },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 10,
  },
  demoText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  demoHint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});
