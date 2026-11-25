const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const EmailCode = require('../models/EmailCode');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { mailMode, sendCodeEmail } = require('../services/mail.service');

const CODE_TTL_MS = 10 * 60 * 1000; // code valid for 10 minutes
const RESEND_AFTER_MS = 60 * 1000; // one resend per minute
const MAX_ATTEMPTS = 5; // wrong codes before the challenge is burned
const MAX_SENDS = 5;

const email = z.string().trim().toLowerCase().email('Email noto\'g\'ri formatda.');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ism kamida 2 belgidan iborat bo\'lsin.'),
  email,
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo\'lsin.'),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Parolni kiriting.'),
});

const verifySchema = z.object({
  challengeId: z.string().regex(/^[a-f0-9]{24}$/, 'Tasdiqlash so\'rovi topilmadi.'),
  code: z.string().trim().regex(/^\d{6}$/, 'Kod 6 ta raqamdan iborat.'),
});

const resendSchema = z.object({ challengeId: verifySchema.shape.challengeId });
const googleSchema = z.object({
  credential: z.string().min(20, 'Google javobi noto\'g\'ri.'),
  // Mobile only: the secret whose SHA-256 the app sent to Google as `nonce`.
  nonce: z.string().min(32).max(128).optional(),
});

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const sameText = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, telegramLinked: !!user.telegramId };
}

const session = (user) => ({ token: signToken(user), user: toPublicUser(user) });

// Demo accounts (patient@pulse.demo etc.) have no real inbox — they skip the
// email step so the presentation logins keep working.
function needsEmailCode(addr) {
  if (mailMode() === 'off') return false;
  const exempt = (process.env.OTP_EXEMPT_DOMAINS ?? 'pulse.demo').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
  return !exempt.includes(addr.split('@')[1]);
}

const hashCode = (id, code) => crypto.createHash('sha256').update(`${id}:${code}:${process.env.JWT_SECRET}`).digest('hex');
const newCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const maskEmail = (addr) => {
  const [user, domain] = addr.split('@');
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`;
};

async function startChallenge({ addr, purpose, user, pending }) {
  // Only one live challenge per email + purpose.
  await EmailCode.deleteMany({ email: addr, purpose });
  const challenge = new EmailCode({ email: addr, purpose, user, pending, codeHash: 'x', expiresAt: new Date(Date.now() + CODE_TTL_MS) });
  const code = newCode();
  challenge.codeHash = hashCode(challenge._id, code);
  await challenge.save();
  try {
    await sendCodeEmail(addr, code, purpose);
  } catch (err) {
    await challenge.deleteOne();
    console.error('[auth] code email failed:', err.response?.data || err.message);
    throw new ApiError(502, 'Tasdiqlash kodini emailga yuborib bo\'lmadi. Birozdan keyin qayta urinib ko\'ring.');
  }
  return {
    otpRequired: true,
    challengeId: challenge._id,
    email: maskEmail(addr),
    expiresIn: CODE_TTL_MS / 1000,
    resendIn: RESEND_AFTER_MS / 1000,
  };
}

async function createPatient({ name, email: addr, passwordHash }) {
  const user = await User.create({ name, email: addr, passwordHash, role: 'patient' });
  await HealthProfile.create({ user: user._id });
  return user;
}

const register = asyncHandler(async (req, res) => {
  const { name, email: addr, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: addr });
  if (existing) throw new ApiError(400, 'Bu email bilan foydalanuvchi allaqachon ro\'yxatdan o\'tgan.');

  const passwordHash = await bcrypt.hash(password, 10);
  if (needsEmailCode(addr)) {
    return res.json(await startChallenge({ addr, purpose: 'register', pending: { name, passwordHash } }));
  }
  const user = await createPatient({ name, email: addr, passwordHash });
  res.status(201).json(session(user));
});

const login = asyncHandler(async (req, res) => {
  const { email: addr, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email: addr });
  if (!user) throw new ApiError(400, 'Email yoki parol noto\'g\'ri.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(400, 'Email yoki parol noto\'g\'ri.');

  if (needsEmailCode(addr)) return res.json(await startChallenge({ addr, purpose: 'login', user: user._id }));
  res.json(session(user));
});

// Step 2: the 6-digit code from the email.
const verifyCode = asyncHandler(async (req, res) => {
  const { challengeId, code } = verifySchema.parse(req.body);
  const challenge = await EmailCode.findById(challengeId);
  if (!challenge || challenge.expiresAt < new Date()) {
    throw new ApiError(400, 'Kodning muddati tugagan. Qaytadan kiring yoki yangi kod so\'rang.');
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await challenge.deleteOne();
    throw new ApiError(429, 'Juda ko\'p noto\'g\'ri urinish. Qaytadan kiring.');
  }

  const ok = crypto.timingSafeEqual(Buffer.from(hashCode(challenge._id, code)), Buffer.from(challenge.codeHash));
  if (!ok) {
    challenge.attempts += 1;
    await challenge.save();
    const left = MAX_ATTEMPTS - challenge.attempts;
    throw new ApiError(400, left > 0 ? `Kod noto'g'ri. Yana ${left} ta urinish qoldi.` : 'Juda ko\'p noto\'g\'ri urinish. Qaytadan kiring.');
  }

  await challenge.deleteOne();
  if (challenge.purpose === 'login') {
    const user = await User.findById(challenge.user);
    if (!user) throw new ApiError(400, 'Foydalanuvchi topilmadi.');
    return res.json(session(user));
  }

  if (await User.exists({ email: challenge.email })) {
    throw new ApiError(400, 'Bu email bilan foydalanuvchi allaqachon ro\'yxatdan o\'tgan.');
  }
  const user = await createPatient({ name: challenge.pending.name, email: challenge.email, passwordHash: challenge.pending.passwordHash });
  res.status(201).json(session(user));
});

const resendCode = asyncHandler(async (req, res) => {
  const { challengeId } = resendSchema.parse(req.body);
  const challenge = await EmailCode.findById(challengeId);
  if (!challenge || challenge.expiresAt < new Date()) {
    throw new ApiError(400, 'Kodning muddati tugagan. Qaytadan kiring.');
  }
  const wait = RESEND_AFTER_MS - (Date.now() - challenge.lastSentAt.getTime());
  if (wait > 0) throw new ApiError(429, `Yangi kodni ${Math.ceil(wait / 1000)} soniyadan keyin so'rash mumkin.`);
  if (challenge.sends >= MAX_SENDS) throw new ApiError(429, 'Kod juda ko\'p marta yuborildi. Qaytadan kiring.');

  const code = newCode();
  challenge.codeHash = hashCode(challenge._id, code);
  challenge.attempts = 0;
  challenge.sends += 1;
  challenge.lastSentAt = new Date();
  challenge.expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await challenge.save();
  try {
    await sendCodeEmail(challenge.email, code, challenge.purpose);
  } catch (err) {
    console.error('[auth] code email failed:', err.response?.data || err.message);
    throw new ApiError(502, 'Kodni yuborib bo\'lmadi. Birozdan keyin qayta urinib ko\'ring.');
  }
  res.json({ ok: true, email: maskEmail(challenge.email), expiresIn: CODE_TTL_MS / 1000, resendIn: RESEND_AFTER_MS / 1000 });
});

// "Google orqali kirish": verify the Google ID token, then sign in (or sign
// up) the owner of that verified email. Google already proved the inbox, so
// no email code is needed here.
const google = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new ApiError(503, 'Google orqali kirish hozircha sozlanmagan.');
  const { credential, nonce } = googleSchema.parse(req.body);

  let info;
  try {
    info = (await axios.get('https://oauth2.googleapis.com/tokeninfo', { params: { id_token: credential }, timeout: 10000 })).data;
  } catch {
    throw new ApiError(401, 'Google tasdiqlovi yaroqsiz. Qaytadan urinib ko\'ring.');
  }
  const verified = info.email_verified === true || info.email_verified === 'true';
  if (info.aud !== clientId || !['accounts.google.com', 'https://accounts.google.com'].includes(info.iss) || !verified || !info.email) {
    throw new ApiError(401, 'Google tasdiqlovi yaroqsiz. Qaytadan urinib ko\'ring.');
  }
  // Mobile tokens carry sha256(secret) as nonce; only the app that started the
  // sign-in knows the secret, so a token caught on its way back is useless.
  if (info.nonce && !(nonce && sameText(sha256(nonce), String(info.nonce)))) {
    throw new ApiError(401, 'Google tasdiqlovi yaroqsiz. Qaytadan urinib ko\'ring.');
  }

  const addr = String(info.email).toLowerCase();
  let user = await User.findOne({ email: addr });
  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10); // password login stays unusable until reset
    user = await createPatient({ name: info.name || addr.split('@')[0], email: addr, passwordHash });
  }
  res.json(session(user));
});

// Public: lets the apps decide what to show (Google button, code step).
const config = (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null, emailCode: mailMode() !== 'off' });
};

const me = asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

module.exports = { register, login, verifyCode, resendCode, google, config, me, toPublicUser };
