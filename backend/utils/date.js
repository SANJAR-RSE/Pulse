// PULSE users are in Uzbekistan, but Render runs in UTC. Every "today" /
// "now" used for health logs, queues and slots must be the user's local day,
// otherwise between 00:00 and 05:00 Tashkent time everything lands on the
// previous date. One place to get it right.
const TZ = process.env.APP_TIMEZONE || 'Asia/Tashkent';

const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

// YYYY-MM-DD in the app timezone.
function todayStr(now = new Date()) {
  return dateFmt.format(now);
}

// HH:mm in the app timezone.
function nowTimeStr(now = new Date()) {
  return timeFmt.format(now);
}

// YYYY-MM-DD shifted by `days` from a YYYY-MM-DD string (pure calendar math).
function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 0 = Sunday ... 6 = Saturday, for a YYYY-MM-DD calendar date.
function weekdayOf(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

module.exports = { TZ, todayStr, nowTimeStr, addDays, weekdayOf };
