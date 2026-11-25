const { z } = require('zod');

// Zod's built-in messages are English ("Invalid input: expected string,
// received undefined"). Schemas already carry Uzbek messages for their own
// rules (min/regex/...); this global map covers everything they don't —
// missing fields, wrong types, unknown enum values — so every 400 the API
// returns reads as a clear Uzbek sentence. Schema-level messages still win.

const FIELD = {
  name: 'Ism',
  email: 'Email',
  password: 'Parol',
  doctorId: 'Shifokor',
  date: 'Sana',
  time: 'Vaqt',
  times: 'Qabul vaqtlari',
  amountMl: 'Suv miqdori',
  sleepTime: 'Uxlagan vaqt',
  wakeTime: "Uyg'ongan vaqt",
  type: "Mashg'ulot turi",
  durationMinutes: 'Davomiylik (daqiqa)',
  calories: 'Kaloriya',
  examination: "Ko'rik xulosasi",
  recommendation: 'Tavsiya',
  labResults: 'Tahlillar',
  prescriptions: 'Dorilar',
  dosage: 'Doza',
  mealRelation: 'Ovqatga nisbatan vaqt',
  durationDays: 'Davomiylik (kun)',
  note: 'Izoh',
  goals: "Me'yorlar",
  waterMl: "Suv me'yori",
  sleepHours: "Uyqu me'yori",
  workoutMinutes: "Workout me'yori",
  value: 'Natija',
  message: 'Xabar',
  code: 'Kod',
  telegramId: 'Telegram ID',
  chatId: 'Chat ID',
};

const TYPE = { string: 'matn', number: 'raqam', int: 'butun son', boolean: "ha/yo'q qiymati", array: "ro'yxat", object: 'obyekt', date: 'sana' };

function fieldLabel(path = []) {
  const key = [...path].reverse().find((p) => typeof p === 'string');
  return key ? FIELD[key] || `"${key}"` : null;
}

function uzMessage(iss) {
  const label = fieldLabel(iss.path);
  switch (iss.code) {
    case 'invalid_type':
      if (!label) return "So'rov tanasi bo'sh yoki noto'g'ri formatda.";
      if (iss.input === undefined || iss.input === null) return `${label} maydoni majburiy.`;
      return `${label} ${TYPE[iss.expected] || iss.expected} bo'lishi kerak.`;
    case 'invalid_value':
      return `${label || 'Qiymat'} noto'g'ri: ruxsat etilgan qiymatlardan birini tanlang.`;
    case 'invalid_format':
      return `${label || 'Qiymat'} noto'g'ri formatda.`;
    case 'too_small':
      if (iss.origin === 'string') return `${label || 'Matn'} kamida ${iss.minimum} belgidan iborat bo'lsin.`;
      if (iss.origin === 'array') return `${label || "Ro'yxat"} kamida ${iss.minimum} ta bo'lsin.`;
      return `${label || 'Qiymat'} kamida ${iss.minimum} bo'lsin.`;
    case 'too_big':
      if (iss.origin === 'string') return `${label || 'Matn'} ${iss.maximum} belgidan oshmasin.`;
      if (iss.origin === 'array') return `${label || "Ro'yxat"} ${iss.maximum} tadan oshmasin.`;
      return `${label || 'Qiymat'} ${iss.maximum} dan oshmasin.`;
    case 'unrecognized_keys':
      return "So'rovda ortiqcha maydonlar bor.";
    default:
      return `${label || "So'rov ma'lumotlari"} noto'g'ri.`;
  }
}

z.config({ customError: (iss) => uzMessage(iss) });

module.exports = { uzMessage };
