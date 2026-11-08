const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PK_PHONE_RE = /^(\+92|0)[\s-]?\d{2,3}[\s-]?\d{6,8}$/;

export const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) return 'Email is required';
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email';
  return undefined;
};

export const validatePassword = (value: string): string | undefined => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'Min. 6 characters';
  return undefined;
};

export const validateRequired = (value: string, label: string): string | undefined =>
  value.trim() ? undefined : `${label} is required`;

export const validatePhone = (value: string): string | undefined => {
  if (!value.trim()) return 'Phone number is required';
  if (!PK_PHONE_RE.test(value.replace(/\s/g, ''))) return 'Enter a valid number, e.g. +92-300-1234567';
  return undefined;
};

export const validateUnits = (value: string): string | undefined => {
  const n = Number(value);
  if (!value.trim()) return 'Units are required';
  if (!Number.isInteger(n) || n < 1 || n > 10) return 'Enter a valid number (1–10)';
  return undefined;
};
