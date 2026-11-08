const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const minutesAgo = (m: number) => new Date(Date.now() - m * MINUTE).toISOString();
export const hoursAgo = (h: number) => new Date(Date.now() - h * HOUR).toISOString();

/** Parses `YYYY-MM-DD` as a local date (avoids UTC shift) or any ISO string. */
export const parseDate = (value: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

export const toISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** "15 Aug 2024" */
export const formatDayMonthYear = (value: string) => {
  const d = parseDate(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Aug 15, 2024" */
export const formatMonthDayYear = (value: string) => {
  const d = parseDate(value);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const formatTime = (value: string) => {
  const d = parseDate(value);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

/** "Just now", "5m ago", "3h ago", "2d ago" */
export const timeAgo = (value: string) => {
  const diff = Date.now() - parseDate(value).getTime();
  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  return `${Math.floor(diff / DAY)}d ago`;
};

export const addDays = (value: string, days: number) => {
  const d = parseDate(value);
  d.setDate(d.getDate() + days);
  return d;
};

export const addMonths = (value: string, months: number) => {
  const d = parseDate(value);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / DAY);

export const getGreeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
