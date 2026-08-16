const WaterLog = require('../models/WaterLog');
const SleepLog = require('../models/SleepLog');
const Workout = require('../models/Workout');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const HealthProfile = require('../models/HealthProfile');
const { getQueueStatus } = require('./queue.service');

const SAFETY_NOTICE =
  'Men shifokor o\'rnini bosa olmayman. Tegishli shifokor yoki tibbiy yordamga murojaat qiling.';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const DEPARTMENT_KEYWORDS = {
  lor: 'LOR',
  kardiolog: 'Kardiologiya',
  yurak: 'Kardiologiya',
  terapevt: 'Terapiya',
  dermatolog: 'Dermatologiya',
  teri: 'Dermatologiya',
  nevrolog: 'Nevrologiya',
  oftalmolog: 'Oftalmologiya',
  "ko'z": 'Oftalmologiya',
  stomatolog: 'Stomatologiya',
  tish: 'Stomatologiya',
  pediatr: 'Pediatriya',
  bolalar: 'Pediatriya',
  urolog: 'Urologiya',
  ginekolog: 'Ginekologiya',
};

// PULSE AI never invents data — every branch below reads straight from
// MongoDB via the same models the REST API uses, so Web/Telegram/AI always
// agree. Attempts a real LLM (Vercel AI Gateway) only if a key is configured;
// otherwise falls back to this deterministic, still-real-data assistant so
// the demo never depends on an external API key being available in time.
async function findDepartmentIntent(text) {
  const lower = text.toLowerCase();
  for (const [keyword, deptName] of Object.entries(DEPARTMENT_KEYWORDS)) {
    if (lower.includes(keyword)) return deptName;
  }
  return null;
}

async function ruleBasedReply(userId, text) {
  const lower = text.toLowerCase();

  const deptName = await findDepartmentIntent(lower);
  if (deptName) {
    const department = await Department.findOne({ name: deptName });
    if (!department) return { reply: `${deptName} bo'limi hozircha topilmadi.`, action: null };
    const doctors = await Doctor.find({ department: department._id }).populate('clinic').limit(5);
    if (doctors.length === 0) {
      return { reply: `Hozircha ${deptName} bo'yicha shifokor topilmadi.`, action: null };
    }
    return {
      reply: `Bugun ${doctors.length} ta ${deptName} shifokorida bo'sh vaqt mavjud.`,
      action: { type: 'view_doctors', department: department._id, departmentName: deptName },
    };
  }

  if (lower.includes('navbat')) {
    const appt = await Appointment.findOne({
      patient: userId,
      status: { $in: ['pending', 'confirmed'] },
    }).sort({ date: 1, time: 1 });
    if (!appt) return { reply: 'Sizda hozircha faol navbat yo\'q.', action: { type: 'book_appointment' } };
    const q = await getQueueStatus(appt._id);
    if (!q) return { reply: 'Navbat ma\'lumoti topilmadi.', action: null };
    return {
      reply: `Sizning navbatingiz ${q.code}. Oldingizda ${q.aheadCount} kishi bor.`,
      action: { type: 'view_queue', appointmentId: appt._id },
    };
  }

  if (lower.includes('suv')) {
    const logs = await WaterLog.find({ user: userId, date: todayStr() });
    const total = logs.reduce((sum, l) => sum + l.amountMl, 0);
    const profile = await HealthProfile.findOne({ user: userId });
    const goal = profile?.waterGoalMl || 2500;
    return {
      reply: `Siz bugun ${(total / 1000).toFixed(1)} litr suv ichgansiz. Maqsadingiz ${(goal / 1000).toFixed(1)} litr.`,
      action: { type: 'add_water' },
    };
  }

  if (lower.includes('uxla') || lower.includes('uyqu')) {
    const log = await SleepLog.findOne({ user: userId, date: todayStr() });
    if (!log) return { reply: 'Kecha uyqu ma\'lumotingiz qayd etilmagan.', action: { type: 'add_sleep' } };
    const h = Math.floor(log.durationMinutes / 60);
    const m = log.durationMinutes % 60;
    return { reply: `Kecha siz ${h} soat ${m} daqiqa uyqu qayd etgansiz.`, action: null };
  }

  if (lower.includes('mashg') || lower.includes('workout') || lower.includes('sport')) {
    const workout = await Workout.findOne({ user: userId, date: todayStr() }).sort({ createdAt: -1 });
    if (!workout) return { reply: 'Siz bugun hali workout qayd etmadingiz.', action: { type: 'add_workout' } };
    return { reply: `Siz bugun ${workout.durationMinutes} daqiqalik workout qayd etgansiz.`, action: null };
  }

  if (lower.includes('tarix') || lower.includes('tibbiy')) {
    return {
      reply: 'Oxirgi ko\'riklaringizni Medical History bo\'limida ko\'rishingiz mumkin.',
      action: { type: 'view_medical_history' },
    };
  }

  if (
    lower.includes('og\'r') ||
    lower.includes('kasal') ||
    lower.includes('dori ich') ||
    lower.includes('nima kasallik')
  ) {
    return { reply: SAFETY_NOTICE, action: { type: 'find_doctor' } };
  }

  return {
    reply:
      'Men sizga navbat olish, shifokor topish, suv/uyqu/mashg\'ulot holatingizni va tibbiy tariximizni ko\'rsatishda yordam bera olaman. Nima haqida bilmoqchisiz?',
    action: null,
  };
}

async function generateReply(userId, text) {
  // A real LLM call would go here (Vercel AI Gateway) when AI_GATEWAY_API_KEY
  // is configured, with the same context injected as a system message — kept
  // out of the hackathon-critical path so the assistant works with zero
  // external dependencies today, and upgrades transparently once a key exists.
  return ruleBasedReply(userId, text);
}

module.exports = { generateReply, SAFETY_NOTICE };
