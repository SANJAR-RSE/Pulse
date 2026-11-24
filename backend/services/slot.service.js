const Appointment = require('../models/Appointment');
const { todayStr, nowTimeStr, weekdayOf } = require('../utils/date');

const WEEKDAY_CODES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOT_MINUTES = 30;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

// The single source of truth for "which times can this doctor be booked at
// on this date". Used by the slots endpoint, by booking validation and by
// PULSE AI, so none of them can ever disagree with each other.
//   - past dates and non-working days -> no slots
//   - today: times that already passed (app timezone) are excluded
//   - every ACTIVE appointment occupies its slot (pending, confirmed AND
//     completed — a visit finished early still owns that time). This is the
//     exact rule of the unique index, so "shown free" always means "bookable".
async function getAvailableSlots(doctor, date) {
  const today = todayStr();
  if (date < today) return [];
  if (!doctor.workingDays.includes(WEEKDAY_CODES[weekdayOf(date)])) return [];

  const start = timeToMinutes(doctor.workingHours.start);
  const end = timeToMinutes(doctor.workingHours.end);
  const now = date === today ? nowTimeStr() : null;

  const booked = new Set(
    await Appointment.find({ doctor: doctor._id, date, active: true }).distinct('time')
  );

  const slots = [];
  for (let t = start; t < end; t += SLOT_MINUTES) {
    const time = minutesToTime(t);
    if (now && time <= now) continue;
    if (!booked.has(time)) slots.push(time);
  }
  return slots;
}

module.exports = { getAvailableSlots, SLOT_MINUTES };
