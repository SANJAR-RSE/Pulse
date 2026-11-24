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

// Render's free tier spins a web service down after ~15 min of no inbound
// traffic. The backend usually stays warm from real Web/Telegram usage, but
// a self-ping keeps it (and, indirectly, the bot's PULSE AI calls that
// depend on it) reliably always-on during idle stretches too.
function startKeepalive() {
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (!selfUrl) return;
  setInterval(() => {
    fetch(`${selfUrl}/api/health-check`).catch(() => {
      /* best-effort keepalive — a failed ping isn't worth crashing over */
    });
  }, 10 * 60 * 1000);
  console.log(`[keepalive] self-pinging ${selfUrl} every 10 min`);
}

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[server] PULSE backend running on port ${PORT}`));
    startKeepalive();
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

start();
