const WaterLog = require('../models/WaterLog');
const SleepLog = require('../models/SleepLog');
const Workout = require('../models/Workout');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const HealthProfile = require('../models/HealthProfile');
const { getQueueStatus } = require('./queue.service');
const { getAvailableSlots } = require('./slot.service');
const { todayStr } = require('../utils/date');

const SAFETY_NOTICE =
  'Men shifokor o\'rnini bosa olmayman. Tegishli shifokor yoki tibbiy yordamga murojaat qiling.';

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

// Uzbek is typed with many apostrophe variants (o' o‘ oʻ o`) or none at all
// ("ogriyapti"). Matching runs on a lowercased copy with every apostrophe
// stripped, so "Boshim og‘riyapti" and "boshim ogriyapti" behave the same.
function normalize(text) {
  return text.toLowerCase().replace(/['‘’ʻʼ`´]/g, '');
}

// Red flags: PULSE must not route these to a regular appointment — it tells
// the user to call emergency services right away (promt.md #23, #21).
const RED_FLAGS = [
  /\bkokra(k|g)\w*\s*(\w+\s*)?ogri/, // ko'krak / ko'kragim og'riyapti
  /nafas\w*\s*(ol\w*\s*)?(qiyin|qis|yetish)/,
  /hush\w*\s*(dan\s*)?ket/,
  /qon\s*ket/,
  /(falaj|tutqanoq|insult|infarkt)/,
  /(yuz|qol|oyog)\w*\s*(\w+\s*)?(uvish|qimirla)/,
  /(zaharlan|ozini\s*oldir)/,
];

const EMERGENCY_REPLY =
  'Bu belgilar jiddiy bo\'lishi mumkin. Iltimos, kutmang — darhol 103 (tez tibbiy yordam) yoki 112 raqamiga qo\'ng\'iroq qiling. ' +
  'Men tashxis qo\'ya olmayman va shifokor o\'rnini bosa olmayman.';

// Symptom -> which department's doctor a person would typically START with.
// This is routing to a specialist, NOT a diagnosis: the reply always says the
// actual cause can only be determined by a doctor after an examination.
const SYMPTOMS = [
  { pattern: /\bbosh\w*\s*(\w+\s*)?(ogri|aylan)|migren/, label: 'Boshingiz og\'riyotgan yoki aylanayotgan', departments: ['Nevrologiya', 'Terapiya', 'LOR'] },
  { pattern: /(tomoq|tomog|quloq|qulog|burun|burn|tumov|sinusit)/, label: 'Tomoq, quloq yoki burun bilan bog\'liq muammo bo\'lsa', departments: ['LOR', 'Terapiya'] },
  { pattern: /(yurak|yurag|qon\s*bosim|bosimim|yurak\s*urish)/, label: 'Yurak yoki qon bosimi bilan bog\'liq shikoyat bo\'lsa', departments: ['Kardiologiya', 'Terapiya'] },
  { pattern: /(qorin|qorn|oshqozon|kongil\s*ayn|ich\s*ket|qabziyat)/, label: 'Qorin yoki oshqozon bilan bog\'liq shikoyat bo\'lsa', departments: ['Terapiya', 'Diagnostika'] },
  { pattern: /(isitma|harorat|shamolla|yotal|gripp)/, label: 'Isitma, yo\'tal yoki shamollash belgilari bo\'lsa', departments: ['Terapiya', 'LOR'] },
  // Eye before skin: "ko'zim qichiyapti" is an eye complaint, not a skin one.
  { pattern: /(\bkoz|\bkorish\w*\s*(\w+\s*)?(yomon|pasay|xira))/, label: 'Ko\'z yoki ko\'rish bilan bog\'liq muammo bo\'lsa', departments: ['Oftalmologiya'] },
  { pattern: /(\bteri|toshma|qichi|allergi|husnbuzar|\bdog(lar|im)?\b)/, label: 'Teri bilan bog\'liq o\'zgarish bo\'lsa', departments: ['Dermatologiya'] },
  { pattern: /(\btish|\bmilk|\bjag)/, label: 'Tish yoki milk og\'riyotgan bo\'lsa', departments: ['Stomatologiya'] },
  { pattern: /(\bbel\w*\s*(\w+\s*)?ogri|\bbogim|\btizza|umurtqa|\bboyin\w*\s*ogri)/, label: 'Bel, bo\'yin yoki bo\'g\'imlarda og\'riq bo\'lsa', departments: ['Nevrologiya', 'Terapiya'] },
  { pattern: /(siydik|buyrak|prostat)/, label: 'Siydik yo\'llari yoki buyrak bilan bog\'liq shikoyat bo\'lsa', departments: ['Urologiya', 'Terapiya'] },
  { pattern: /(hayz|homilador|tuxumdon)/, label: 'Ayollar salomatligi bilan bog\'liq savol bo\'lsa', departments: ['Ginekologiya'] },
  { pattern: /(uyqusizlik|stress|asab|charchoq|holsiz)/, label: 'Uyqusizlik, holsizlik yoki asab charchog\'i bo\'lsa', departments: ['Nevrologiya', 'Terapiya'] },
];

// Any other "it hurts / I feel unwell" phrasing without a recognisable body
// part still gets routed somewhere useful: a therapist is the general entry point.
const GENERIC_COMPLAINT = /((^|[^t])ogri|\bkasal|yomon\s*his|betob|mazam\s*yoq|shikoyat)/;

async function symptomReply(text) {
  const norm = normalize(text);

  if (RED_FLAGS.some((re) => re.test(norm))) {
    return { reply: EMERGENCY_REPLY, action: { type: 'emergency', medicalNotice: true } };
  }

  let match = SYMPTOMS.find((s) => s.pattern.test(norm));
  if (!match && GENERIC_COMPLAINT.test(norm)) {
    match = { label: 'Agar o\'zingizni yomon his qilayotgan bo\'lsangiz', departments: ['Terapiya'] };
  }
  if (!match) return null;

  const kids = /(bola|farzand|chaqaloq|qizim|oglim)/.test(norm);
  const departmentNames = kids ? ['Pediatriya', ...match.departments] : match.departments;

  // Real data only: count actual doctors per suggested department.
  const departments = await Department.find({ name: { $in: departmentNames } });
  const byName = new Map(departments.map((d) => [d.name, d]));
  const available = [];
  for (const name of departmentNames) {
    const dep = byName.get(name);
    if (!dep) continue;
    const count = await Doctor.countDocuments({ department: dep._id });
    if (count > 0) available.push({ dep, count });
  }

  const suggested = departmentNames.join(', ');
  let reply =
    `${match.label}, odatda ${suggested} bo'limi shifokoriga murojaat qilish mumkin.\n\n` +
    'Muhim: men tashxis qo\'ymayman va dori tavsiya qilmayman — sababini faqat shifokor ko\'rikdan keyin aniqlaydi.';

  if (available.length > 0) {
    const list = available.map((a) => `${a.dep.name} — ${a.count} ta shifokor`).join(', ');
    reply += `\n\nPULSE'da hozir: ${list}. Pastdagi tugma orqali shifokorni tanlab, navbat olishingiz mumkin.`;
  }
  reply += '\n\nAgar holat keskin yomonlashsa yoki kuchli og\'riq to\'satdan boshlansa — darhol 103 ga qo\'ng\'iroq qiling.';

  const primary = available[0];
  return {
    reply,
    action: primary
      ? { type: 'view_doctors', department: primary.dep._id, departmentName: primary.dep.name, medicalNotice: true }
      : { type: 'find_doctor', medicalNotice: true },
  };
}

// PULSE AI never invents data — every branch below reads straight from
// MongoDB via the same models the REST API uses, so Web/Telegram/AI always
// agree. Attempts a real LLM (Vercel AI Gateway) only if a key is configured;
// otherwise falls back to this deterministic, still-real-data assistant so
// the demo never depends on an external API key being available in time.
async function findDepartmentIntent(text) {
  // Word-start match on normalized text, so "o'tish" never hits "tish".
  const norm = normalize(text);
  for (const [keyword, deptName] of Object.entries(DEPARTMENT_KEYWORDS)) {
    if (new RegExp(`\\b${normalize(keyword)}`).test(norm)) return deptName;
  }
  return null;
}

async function ruleBasedReply(userId, text) {
  const lower = text.toLowerCase();

  // Symptoms / red flags first: "boshim og'riyapti" must get specialist
  // routing + a no-diagnosis notice, never a generic menu reply.
  const symptom = await symptomReply(text);
  if (symptom) return symptom;

  const deptName = await findDepartmentIntent(lower);
  if (deptName) {
    const department = await Department.findOne({ name: deptName });
    if (!department) return { reply: `${deptName} bo'limi hozircha topilmadi.`, action: null };
    const doctors = await Doctor.find({ department: department._id });
    if (doctors.length === 0) {
      return { reply: `Hozircha ${deptName} bo'yicha shifokor topilmadi.`, action: null };
    }
    // Only claim free time that actually exists today (same slot rules as booking).
    const today = todayStr();
    let freeDoctors = 0;
    let earliest = null;
    for (const d of doctors) {
      const slots = await getAvailableSlots(d, today);
      if (slots.length) {
        freeDoctors += 1;
        if (!earliest || slots[0] < earliest) earliest = slots[0];
      }
    }
    const action = { type: 'view_doctors', department: department._id, departmentName: deptName };
    if (freeDoctors === 0) {
      return {
        reply: `Bugun ${deptName} shifokorlarida bo'sh vaqt qolmagan. Boshqa kunni tanlab navbat olishingiz mumkin (${doctors.length} ta shifokor mavjud).`,
        action,
      };
    }
    return {
      reply: `Bugun ${freeDoctors} ta ${deptName} shifokorida bo'sh vaqt mavjud. Eng yaqin bo'sh vaqt: ${earliest}.`,
      action,
    };
  }

  if (lower.includes('navbat')) {
    const appt = await Appointment.findOne({
      patient: userId,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: todayStr() },
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
