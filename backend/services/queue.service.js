const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const { notify } = require('./notification.service');

// Digital queue is backend-owned: the frontend never invents a countdown or
// position, it only ever renders what this service computed and persisted.
//
// Serving order is the APPOINTMENT TIME (then booking order for ties), not
// the order people happened to book in — a 09:00 patient is never queued
// behind a 16:00 one just because they booked later.
const SERVE_ORDER = { time: 1, position: 1 };
const ACTIVE = ['WAITING', 'NEAR'];

async function createQueueEntry({ appointment, patient, doctor, department, date, time }) {
  const count = await Queue.countDocuments({ doctor, date });
  const dep = await Department.findById(department);
  const letter = (dep?.name?.[0] || 'A').toUpperCase();
  const position = count + 1;

  return Queue.create({
    appointment,
    patient,
    doctor,
    date,
    time,
    code: `${letter}-${20 + position}`,
    position,
    status: 'WAITING',
  });
}

// Finishes serving the currently-called patient (if any) and calls the next
// one in time order. Notifies the newly-called patient and marks the
// following one as NEAR.
async function callNext(doctorId, date) {
  const current = await Queue.findOne({ doctor: doctorId, date, status: 'CALLED' });
  if (current) {
    current.status = 'COMPLETED';
    await current.save();
    // The visit happened — the appointment must not keep showing up as the
    // patient's "next appointment" on the dashboard / in PULSE AI.
    await Appointment.updateOne(
      { _id: current.appointment, status: { $in: ['pending', 'confirmed'] } },
      { status: 'completed' }
    );
  }

  const upcoming = await Queue.find({ doctor: doctorId, date, status: { $in: ACTIVE } }).sort(SERVE_ORDER);
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
  if (near && near.status !== 'NEAR') {
    near.status = 'NEAR';
    await near.save();
    await notify(
      near.patient,
      'queue_near',
      'Navbatingiz yaqinlashmoqda',
      `Siz navbatdagi keyingi bemorsiz (${near.code}). Tayyor turing.`
    );
  }

  return { called, near: near || null };
}

async function getQueueStatus(appointmentId) {
  const entry = await Queue.findOne({ appointment: appointmentId });
  if (!entry) return null;

  const waiting = ACTIVE.includes(entry.status);
  let ahead = 0;
  if (waiting) {
    const myTime = entry.time || '';
    ahead = await Queue.countDocuments({
      doctor: entry.doctor,
      date: entry.date,
      status: { $in: ACTIVE },
      $or: [{ time: { $lt: myTime } }, { time: myTime, position: { $lt: entry.position } }],
    });
  }

  return {
    code: entry.code,
    status: entry.status,
    aheadCount: ahead,
    estimatedWaitMinutes: ahead * 15,
  };
}

module.exports = { createQueueEntry, callNext, getQueueStatus, SERVE_ORDER };
