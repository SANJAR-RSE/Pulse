const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Queue = require('../models/Queue');

// Real-time layer (Socket.IO). Design rules:
//  - Every socket is authenticated with the same JWT the REST API uses.
//  - Each user only ever joins THEIR OWN rooms:
//      user:<userId>      — everything addressed to that person
//      doctor:<doctorId>  — the doctor's live queue (doctor accounts only)
//    so one patient can never receive another patient's data.
//  - Events are "something changed" signals carrying minimal, already
//    user-scoped payloads; clients refetch through the normal REST API, which
//    stays the single source of truth. Nothing here can drift from MongoDB.
//  - Every emit helper is a no-op when the server isn't running (seed script,
//    tests), and never throws into a request handler.

let io = null;

const userRoom = (id) => `user:${id}`;
const doctorRoom = (id) => `doctor:${id}`;

function initRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
    // Render's proxy closes idle connections; frequent pings keep them alive
    // and detect dead clients fast.
    pingInterval: 20000,
    pingTimeout: 20000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('UNAUTHORIZED'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub).select('_id role doctor name');
      if (!user) return next(new Error('UNAUTHORIZED'));
      socket.data.user = user;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(userRoom(user._id));
    if (user.role === 'doctor' && user.doctor) socket.join(doctorRoom(user.doctor));
    socket.emit('ready', { userId: String(user._id), doctor: user.doctor ? String(user.doctor) : null });
  });

  console.log('[realtime] Socket.IO ready');
  return io;
}

function safeEmit(room, event, payload) {
  if (!io) return;
  try {
    io.to(room).emit(event, payload);
  } catch (err) {
    console.error('[realtime] emit failed:', err.message);
  }
}

function emitToUser(userId, event, payload = {}) {
  if (userId) safeEmit(userRoom(String(userId)), event, payload);
}

// The queue of one doctor on one day changed (booking, cancel, call next,
// exam finished). The doctor's panel refreshes, and so does EVERY patient in
// that queue — their "people ahead of you" count just changed too.
async function emitQueueChanged(doctorId, date, reason) {
  if (!io || !doctorId) return;
  try {
    const payload = { date, reason };
    safeEmit(doctorRoom(String(doctorId)), 'queue:changed', payload);
    const patients = await Queue.find({ doctor: doctorId, date }).distinct('patient');
    for (const p of patients) emitToUser(p, 'queue:changed', payload);
  } catch (err) {
    console.error('[realtime] queue broadcast failed:', err.message);
  }
}

module.exports = { initRealtime, emitToUser, emitQueueChanged };
