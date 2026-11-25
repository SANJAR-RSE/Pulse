// Populates PULSE with realistic demo data so the hackathon demo never opens
// to an empty screen (promt.md #38). Safe to re-run: wipes and re-creates.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const Clinic = require('../models/Clinic');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const EmergencyContact = require('../models/EmergencyContact');
const WaterLog = require('../models/WaterLog');
const SleepLog = require('../models/SleepLog');
const Workout = require('../models/Workout');
const Medication = require('../models/Medication');

const DEPARTMENTS = [
  'LOR', 'Kardiologiya', 'Terapiya', 'Dermatologiya', 'Nevrologiya',
  'Oftalmologiya', 'Stomatologiya', 'Pediatriya', 'Urologiya', 'Ginekologiya',
  'Laboratoriya', 'Diagnostika',
];

const CLINICS = [
  { name: 'MedLine Clinic', address: 'Amir Temur ko\'chasi 12, Toshkent', phone: '+998 71 200 10 10' },
  { name: 'Tashkent Medical Center', address: 'Mustaqillik shoh ko\'chasi 45, Toshkent', phone: '+998 71 200 20 20' },
  { name: 'City Hospital', address: 'Bunyodkor shoh ko\'chasi 8, Toshkent', phone: '+998 71 200 30 30' },
  { name: 'Neo Clinic', address: 'Yunusobod tumani 4-mavze, Toshkent', phone: '+998 71 200 40 40' },
  { name: 'Family Clinic', address: 'Chilonzor tumani 15-kvartal, Toshkent', phone: '+998 71 200 50 50' },
  { name: 'Shifo Medical', address: 'Sergeli tumani, Toshkent', phone: '+998 71 200 60 60' },
  { name: 'Grand Med', address: 'Mirzo Ulug\'bek tumani, Toshkent', phone: '+998 71 200 70 70' },
  { name: 'Healthy Life Clinic', address: 'Yashnobod tumani, Toshkent', phone: '+998 71 200 80 80' },
];

// 20 UNIQUE doctor names (one per seeded doctor). Cycling 12 first/last
// names used to produce two identical "Dr. Aziz Aliyev, LOR" in different
// clinics — confusing in a demo and easy to book the wrong one.
const DOCTOR_NAMES = [
  ['Aziz', 'Aliyev'], ['Dilnoza', 'Karimova'], ['Bekzod', 'Yusupov'], ['Malika', 'Rashidova'],
  ['Sardor', 'Tashkentov'], ['Nilufar', 'Nazarova'], ['Jasur', "Yo'ldoshev"], ['Zarina', 'Ismoilova'],
  ['Otabek', 'Rahimov'], ['Feruza', 'Sodiqova'], ['Sherzod', 'Mirzayev'], ['Gulnora', 'Ergasheva'],
  ['Javohir', 'Umarov'], ['Kamola', 'Qodirova'], ['Rustam', 'Xolmatov'], ['Madina', 'Saidova'],
  ['Shoxrux', 'Abdullayev'], ['Lola', 'Tursunova'], ['Ulugbek', 'Nematov'], ['Nodira', 'Hasanova'],
];
const FIRST_NAMES = DOCTOR_NAMES.map((n) => n[0]);
const LAST_NAMES = DOCTOR_NAMES.map((n) => n[1]);

function pick(arr, i) {
  return arr[i % arr.length];
}

async function seed() {
  await connectDB();
  console.log('[seed] Connected. Wiping existing demo data...');

  // Wipe EVERY collection — leaving appointments/queues/records/telegram
  // links behind would point at users and doctors that no longer exist.
  const all = [
    User, HealthProfile, Clinic, Department, Doctor, EmergencyContact,
    WaterLog, SleepLog, Workout, Medication,
    require('../models/MedicationLog'),
    require('../models/Appointment'),
    require('../models/Queue'),
    require('../models/MedicalRecord'),
    require('../models/Notification'),
    require('../models/TelegramConnection'),
    require('../models/TelegramLinkCode'),
    require('../models/AIMessage'),
  ];
  await Promise.all(all.map((M) => M.deleteMany({})));

  const departments = await Department.insertMany(DEPARTMENTS.map((name) => ({ name })));
  const clinics = await Clinic.insertMany(
    CLINICS.map((c, i) => ({ ...c, workingHours: '09:00 - 18:00', rating: +(4 + (i % 5) * 0.2).toFixed(1), description: `${c.name} — zamonaviy tibbiy xizmatlar.` }))
  );

  const doctors = [];
  let nameIdx = 0;
  for (let i = 0; i < 20; i += 1) {
    const clinic = clinics[i % clinics.length];
    const department = departments[i % departments.length];
    doctors.push({
      firstName: pick(FIRST_NAMES, nameIdx),
      lastName: pick(LAST_NAMES, nameIdx),
      specialty: department.name,
      experienceYears: 3 + (i % 15),
      rating: +(4 + (i % 5) * 0.2).toFixed(1),
      clinic: clinic._id,
      department: department._id,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: { start: '09:00', end: '17:00' },
    });
    nameIdx += 1;
  }
  await Doctor.insertMany(doctors);

  await EmergencyContact.insertMany([
    { name: 'Tez tibbiy yordam', phone: '103', type: 'ambulance', description: 'Favqulodda tibbiy holatlar uchun.' },
    { name: 'Yong\'in xavfsizligi', phone: '101', type: 'fire', description: 'Yong\'in va qutqaruv xizmati.' },
    { name: 'Politsiya', phone: '102', type: 'police', description: 'Xavfsizlik va huquqiy yordam.' },
    { name: 'Yagona qutqaruv xizmati', phone: '112', type: 'ambulance', description: 'Barcha turdagi favqulodda holatlar.' },
  ]);

  // Demo login accounts (password: "password123" for all) — makes local judging fast.
  const passwordHash = await bcrypt.hash('password123', 10);

  const patient = await User.create({
    name: 'Sanjar Test',
    email: 'patient@pulse.demo',
    passwordHash,
    role: 'patient',
  });
  await HealthProfile.create({ user: patient._id, age: 27, gender: 'male', waterGoalMl: 2500, sleepGoalHours: 8 });

  const today = require('../utils/date').todayStr();
  await WaterLog.insertMany([
    { user: patient._id, amountMl: 500, date: today },
    { user: patient._id, amountMl: 700, date: today },
    { user: patient._id, amountMl: 600, date: today },
  ]);
  await SleepLog.create({ user: patient._id, date: today, sleepTime: '23:30', wakeTime: '06:50', durationMinutes: 440 });
  await Workout.create({ user: patient._id, type: 'Yugurish', durationMinutes: 45, calories: 320, date: today });
  await Medication.insertMany([
    { user: patient._id, name: 'Vitamin D', time: '09:00' },
    { user: patient._id, name: 'Magnesium', time: '21:00' },
  ]);

  const doctorDoc = await Doctor.findOne({ department: departments[0]._id }); // first LOR doctor
  const doctorUser = await User.create({
    name: `${doctorDoc.firstName} ${doctorDoc.lastName}`,
    email: 'doctor@pulse.demo',
    passwordHash,
    role: 'doctor',
    doctor: doctorDoc._id,
  });
  doctorDoc.user = doctorUser._id;
  await doctorDoc.save();

  // Admin sees every user's name/email — use ADMIN_PASSWORD on shared/prod DBs.
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  await User.create({
    name: 'PULSE Admin',
    email: process.env.ADMIN_EMAIL || 'admin@pulse.demo',
    passwordHash: await bcrypt.hash(adminPassword, 10),
    role: 'admin',
  });

  console.log('[seed] Done.');
  console.log('[seed] Demo patient login: patient@pulse.demo / password123');
  console.log('[seed] Demo doctor login:  doctor@pulse.demo / password123');
  console.log(`[seed] Admin login:        ${process.env.ADMIN_EMAIL || 'admin@pulse.demo'} / ${process.env.ADMIN_PASSWORD ? '(ADMIN_PASSWORD)' : 'password123'}`);

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
