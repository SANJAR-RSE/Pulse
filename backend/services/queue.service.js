const Queue = require('../models/Queue');
const Department = require('../models/Department');
const { notify } = require('./notification.service');

// Digital queue is backend-owned: the frontend never invents a countdown or
// position, it only ever renders what this service computed and persisted.

async function createQueueEntry({ appointment, patient, doctor, department, date }) {
  const count = await Queue.countDocuments({ doctor, date });
  const dep = await Department.findById(department);
  const letter = (dep?.name?.[0] || 'A').toUpperCase();
  const position = count + 1;

  return Queue.create({
    appointment,
    patient,
    doctor,
    date,
    code: `${letter}-${20 + position}`,
    position,
    status: 'WAITING',
  });
}

// Marks the currently-called patient as done and advances the queue by one.
// Notifies the newly-called patient and marks the following one as NEAR.
async function callNext(doctorId, date) {
  const current = await Queue.findOne({ doctor: doctorId, date, status: 'CALLED' });
  if (current) {
    current.status = 'COMPLETED';
    await current.save();
  }

  const upcoming = await Queue.find({
    doctor: doctorId,
    date,
    status: { $in: ['WAITING', 'NEAR'] },
  }).sort({ position: 1 });

  if (upcoming.length === 0) return { called: null, near: null };

  const called = upcoming[0];
  called.status = 'CALLED';
  await called.save();
  await notify(
    called.patient,
    'queue_called',
    'Navbatingiz keldi',
    `Sizning navbatingiz keldi (${called.code}). Iltimos, shifokor xonasiga boring.`
  );

  const near = upcoming[1];
  if (near) {
    near.status = 'NEAR';
    await near.save();
    await notify(
      near.patient,
      'queue_near',
      'Navbatingiz yaqinlashmoqda',
      `Siz navbatdagi keyingi bemorsiz (${near.code}). Tayyor turing.`
    );
  }

  return { called, near };
}

async function getQueueStatus(appointmentId) {
  const entry = await Queue.findOne({ appointment: appointmentId }).populate('doctor');
  if (!entry) return null;

  const ahead = await Queue.countDocuments({
    doctor: entry.doctor._id,
    date: entry.date,
    position: { $lt: entry.position },
    status: { $in: ['WAITING', 'NEAR'] },
  });

  return {
    code: entry.code,
    status: entry.status,
    aheadCount: entry.status === 'WAITING' || entry.status === 'NEAR' ? ahead : 0,
    estimatedWaitMinutes: (entry.status === 'WAITING' || entry.status === 'NEAR') ? ahead * 15 : 0,
  };
}

module.exports = { createQueueEntry, callNext, getQueueStatus };
