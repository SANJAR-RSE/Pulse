const mongoose = require('mongoose');

// Idempotent data fixes for databases created by older versions of the app.
// Safe to run on every boot; each step is a no-op once applied.
async function migrate() {
  const Appointment = require('../models/Appointment');
  const Queue = require('../models/Queue');

  // 1) Appointment.active — cancelled ones must stop holding their slot.
  await Appointment.updateMany({ active: { $exists: false }, status: 'cancelled' }, { $set: { active: false } });
  await Appointment.updateMany({ active: { $exists: false } }, { $set: { active: true } });

  // 2) Replace the old "every appointment ever" unique index with the
  //    active-only one declared in the schema.
  const indexes = await Appointment.collection.indexes().catch(() => []);
  if (indexes.some((i) => i.name === 'doctor_1_date_1_time_1')) {
    await Appointment.collection.dropIndex('doctor_1_date_1_time_1');
    console.log('[db] migrated: dropped legacy appointment slot index');
  }
  await Appointment.syncIndexes();

  // 3) Queue.time — queues are served in appointment-time order.
  const missing = await Queue.find({ time: { $exists: false } }).populate('appointment', 'time');
  for (const q of missing) {
    if (q.appointment?.time) {
      q.time = q.appointment.time;
      await q.save();
    }
  }
  if (missing.length) console.log(`[db] migrated: backfilled time on ${missing.length} queue entries`);

  // 4) One medical record per appointment. Never block boot over legacy
  //    duplicates — log them instead so they can be cleaned up by hand.
  const MedicalRecord = require('../models/MedicalRecord');
  await MedicalRecord.syncIndexes().catch((err) =>
    console.warn('[db] medical record unique index not applied (legacy duplicates?):', err.message)
  );
}

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  }
  await mongoose.connect(uri);
  console.log('[db] MongoDB connected');
  await migrate();
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
