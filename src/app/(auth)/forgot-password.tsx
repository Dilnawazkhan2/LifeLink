import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHero } from '@/components/common/AuthHero';
import { Button } from '@/components/common/Button';
import { IconTile } from '@/components/common/Misc';
import { TextField } from '@/components/forms/TextField';
import { Colors } from '@/constants/colors';
import * as auth from '@/services/auth';
import { validateEmail } from '@/utils/validation';

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const err = validateEmail(email);
    setError(err);
    if (err) return;
    setLoading(true);
    const result = await auth.requestPasswordReset(email);
    setLoading(false);
    if (result.ok) setSent(true);
    else setError(result.error);
  };

  const back = () => (router.canGoBack() ? router.back() : router.replace('/login'));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
          <AuthHero topInset={insets.top} compact />
          <Pressable
            onPress={back}
            style={[styles.backBtn, { top: insets.top + 12 }]}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in">
            <ArrowLeft size={22} color={Colors.white} />
          </Pressable>

          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.grabber} />
            {sent ? (
              <View style={styles.success}>
                <IconTile icon={MailCheck} color={Colors.success} bg={Colors.successSoft} size={88} radius={28} />
                <Text style={styles.title}>Check your email</Text>
                <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                  We sent password reset instructions to{'\n'}
                  <Text style={{ color: Colors.text, fontWeight: '700' }}>{email.trim()}</Text>
                </Text>
                <Text style={styles.note}>
                  This is a demo — no email is actually sent. Use the demo account to sign in.
                </Text>
                <Button label="Back to Sign In" size="lg" onPress={back} style={{ marginTop: 12 }} />
                <Pressable onPress={() => setSent(false)} hitSlop={8} style={{ marginTop: 16 }}>
                  <Text style={styles.link}>Didn&apos;t get it? Resend</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                  Enter the email linked to your LifeLink account and we&apos;ll send you a reset link.
                </Text>
                <View style={{ marginTop: 28 }}>
                  <TextField
                    label="Email Address"
                    icon={Mail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="send"
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (error) setError(undefined);
                    }}
                    onSubmitEditing={submit}
                    error={error}
                  />
                </View>
                <Button label="Send Reset Link" size="lg" loading={loading} onPress={submit} style={{ marginTop: 32 }} />
                <Pressable onPress={back} hitSlop={8} style={{ alignSelf: 'center', marginTop: 22 }}>
                  <Text style={styles.link}>Back to Sign In</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primaryDark },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textMuted, marginTop: 8, lineHeight: 22 },
  success: { alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  note: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  link: { fontSize: 15, fontWeight: '700', color: Colors.primary },
});
