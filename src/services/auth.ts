import { DEMO_CREDENTIALS } from '@/data/user';

/** LOCAL SIMULATION — replace with real API calls when a backend exists. */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function login(email: string, password: string): Promise<AuthResult> {
  await wait(900);
  const matches =
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
  return matches
    ? { ok: true }
    : { ok: false, error: 'Invalid email or password. Tap "Use Demo Account" to sign in with the demo profile.' };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  await wait(1100);
  if (!email.trim()) return { ok: false, error: 'Email is required' };
  return { ok: true };
}
