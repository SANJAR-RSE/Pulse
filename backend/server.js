require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

// Dev-only fallback so a fresh clone can run before .env is filled in.
// Production MUST set a real JWT_SECRET (see .env.example).
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'pulse-dev-secret-change-me';
  console.warn('[server] JWT_SECRET not set — using an insecure dev default. Do NOT use in production.');
}

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[server] PULSE backend running on port ${PORT}`));
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

start();
