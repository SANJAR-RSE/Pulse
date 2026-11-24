const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const { notify } = require('./notification.service');
const { todayStr, nowTimeStr } = require('../utils/date');

// Medication reminders: "Vitamin D ichish vaqti keldi." (promt.md #10).
//
// Every minute we look for active medications whose time (Tashkent) falls
// in the last GRACE_MINUTES — so a restart or a slow tick never loses a
// reminder — and send exactly one reminder per medication per day, only if
// it hasn't been taken yet. Delivery goes through notify(): Notification
// record + live Web/mobile + Telegram (with an "✅ Ichdim" button).
const GRACE_MINUTES = 10;

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

async function runReminderTick(now = new Date()) {
  const date = todayStr(now);
  const nowMin = toMin(nowTimeStr(now));
  const window = [];
  for (let m = Math.max(0, nowMin - GRACE_MINUTES); m <= nowMin; m++) window.push(toHHMM(m));

  const due = await Medication.find({ active: true, time: { $in: window } });
  let sent = 0;

  for (const med of due) {
    // Atomically claim today's reminder. If a log for today already exists
    // with remindedAt set, or the dose was already taken, the filter does not
    // match and the upsert hits the unique (medication, date) index -> skip.
    try {
      await MedicationLog.findOneAndUpdate(
        { medication: med._id, date, remindedAt: { $exists: false }, taken: { $ne: true } },
        { $set: { remindedAt: now }, $setOnInsert: { user: med.user, taken: false } },
        { upsert: true }
      );
    } catch (err) {
      if (err.code === 11000) continue; // already reminded or already taken today
      throw err;
    }

    await notify(med.user, 'medication_reminder', 'Dori ichish vaqti', `${med.name} ichish vaqti keldi (${med.time}).`, {
      meta: { medicationId: String(med._id), name: med.name, time: med.time },
      telegramButtons: [[{ text: '✅ Ichdim', callback_data: `med:taken:${med._id}` }]],
    });
    sent += 1;
  }
  return { checked: due.length, sent };
}

let timer = null;

function startReminderScheduler() {
  if (timer) return;
  const tick = () =>
    runReminderTick().then(
      (r) => r.sent && console.log(`[reminders] sent ${r.sent} medication reminder(s)`),
      (err) => console.error('[reminders] tick failed:', err.message)
    );
  // Catch up right away, then run on every minute boundary.
  void tick();
  const msToNextMinute = 60_000 - (Date.now() % 60_000) + 1000;
  setTimeout(() => {
    void tick();
    timer = setInterval(tick, 60_000);
  }, msToNextMinute);
  console.log('[reminders] medication reminder scheduler started');
}

module.exports = { runReminderTick, startReminderScheduler, GRACE_MINUTES };
