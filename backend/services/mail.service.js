const axios = require('axios');

// Email delivery over HTTPS (Brevo transactional API). Render's free tier
// blocks outbound SMTP ports, so SMTP/nodemailer would time out there.
//
// Modes:
//   BREVO_API_KEY + MAIL_FROM set  -> real email
//   EMAIL_OTP=dev (no key)         -> code is printed to the server log (local testing)
//   neither                        -> email codes are off (login works without the 2nd step)

function mailMode() {
  if (process.env.BREVO_API_KEY && process.env.MAIL_FROM) return 'email';
  if (process.env.EMAIL_OTP === 'dev' && process.env.NODE_ENV !== 'production') return 'dev';
  return 'off';
}

function codeEmailHtml(code, purpose) {
  const action = purpose === 'register' ? "ro'yxatdan o'tishni yakunlash" : 'tizimga kirish';
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e8f0">
      <tr><td style="font-size:20px;font-weight:700;color:#2563eb">PULSE</td></tr>
      <tr><td style="padding-top:16px;font-size:15px;color:#111827">PULSE'da ${action} uchun tasdiqlash kodingiz:</td></tr>
      <tr><td style="padding:20px 0;font-size:34px;font-weight:700;letter-spacing:10px;color:#111827">${code}</td></tr>
      <tr><td style="font-size:13px;color:#6b7280;line-height:1.5">Kod 10 daqiqa amal qiladi. Agar bu siz bo'lmasangiz, xatni e'tiborsiz qoldiring — hech kim kodsiz hisobingizga kira olmaydi.</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function sendCodeEmail(to, code, purpose) {
  const mode = mailMode();
  if (mode === 'dev') {
    console.log(`[mail:dev] ${purpose} code for ${to}: ${code}`);
    return;
  }
  if (mode !== 'email') throw new Error('Email sending is not configured.');
  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: { name: 'PULSE', email: process.env.MAIL_FROM },
      to: [{ email: to }],
      subject: `PULSE tasdiqlash kodi: ${code}`,
      htmlContent: codeEmailHtml(code, purpose),
      textContent: `PULSE tasdiqlash kodi: ${code}. Kod 10 daqiqa amal qiladi.`,
    },
    { headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' }, timeout: 15000 }
  );
}

module.exports = { mailMode, sendCodeEmail };
