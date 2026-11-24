// Users are in Uzbekistan; the backend's "today" is the Tashkent date too.
const TZ = 'Asia/Tashkent';

const pad = (n: number) => String(n).padStart(2, '0');

// YYYY-MM-DD in Tashkent. Intl timeZone support is present in Hermes on
// both platforms; the offset fallback keeps it correct if it ever isn't.
export function tashkentToday(now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch {
    const t = new Date(now.getTime() + 5 * 3600_000);
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  }
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];

// "24 noy" / "Bugun" / "Ertaga"
export function dayLabel(date: string, today = tashkentToday()): { top: string; bottom: string } {
  const d = new Date(`${date}T00:00:00Z`);
  const top = date === today ? 'Bugun' : date === addDays(today, 1) ? 'Ertaga' : WEEKDAYS[d.getUTCDay()];
  return { top, bottom: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` };
}

export function prettyDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function minutesLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} daq`;
  if (m === 0) return `${h} soat`;
  return `${h} soat ${m} daq`;
}

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  return `${d} kun oldin`;
}

export function clockTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}
