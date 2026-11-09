import { DEMO_CREDENTIALS } from '@/data/user';

import * as api from './api';
import { isLive } from './backend';

/**
 * Authentication.
 * LIVE mode → Supabase Auth (shared with the LifeLink website; passwords hashed server-side).
 * DEMO mode → local simulation against DEMO_CREDENTIALS (no network).
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: string };

const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

export async function login(email: string, password: string): Promise<AuthResult> {
  if (isLive) {
    try {
      await api.signIn(email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: message(e) };
    }
  }
  await wait(900);
  const matches =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
  return matches
    ? { ok: true }
    : { ok: false, error: 'Invalid email or password. Tap "Use Demo Account" to sign in with the demo profile.' };
}

export async function register(input: api.RegisterInput): Promise<AuthResult> {
  if (!isLive) {
    await wait(700);
    return { ok: false, error: 'Registration needs the LifeLink server. This build runs in demo mode — use the demo account.' };
  }
  try {
    const hasSession = await api.signUp(input);
    return { ok: true, needsConfirmation: !hasSession };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!email.trim()) return { ok: false, error: 'Email is required' };
  if (isLive) {
    try {
      await api.sendPasswordReset(email);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: message(e) };
    }
  }
  await wait(1100);
  return { ok: true };
}

export async function logout(): Promise<void> {
  if (isLive) await api.signOut();
}
