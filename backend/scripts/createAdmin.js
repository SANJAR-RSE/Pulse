// Create (or reset the password of) the admin account without touching any
// other data. Usage: ADMIN_PASSWORD=... [ADMIN_EMAIL=admin@pulse.demo] node scripts/createAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@pulse.demo').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    console.error('[admin] ADMIN_PASSWORD (min 8 chars) is required.');
    process.exit(1);
  }
  await connectDB();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'admin', passwordHash }, $setOnInsert: { name: 'PULSE Admin', email } },
    { upsert: true, returnDocument: 'after' }
  );
  console.log(`[admin] Ready: ${user.email} (role=${user.role})`);
  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  console.error('[admin] Failed:', err.message);
  process.exit(1);
});
