const crypto = require('crypto');
const { z } = require('zod');
const TelegramLinkCode = require('../models/TelegramLinkCode');
const TelegramConnection = require('../models/TelegramConnection');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Web: user asks for a one-time code to paste/deep-link into Telegram.
const createLinkCode = asyncHandler(async (req, res) => {
  await TelegramLinkCode.deleteMany({ user: req.user._id });

  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  await TelegramLinkCode.create({
    user: req.user._id,
    code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const botUsername = process.env.BOT_USERNAME || 'pulse_health_bot';
  res.json({ code, deepLink: `https://t.me/${botUsername}?start=${code}` });
});

const connectSchema = z.object({
  code: z.string().min(4),
  telegramId: z.string().min(1),
  chatId: z.string().min(1),
});

// Bot: called from /start <code> to finish the handshake and merge the
// Telegram identity into the existing PULSE account (never creates a second,
// disconnected identity — see "PULSE ACCOUNT — SINGLE SOURCE OF IDENTITY").
const connect = asyncHandler(async (req, res) => {
  const secret = req.headers['x-bot-secret'];
  if (secret !== process.env.BOT_INTERNAL_SECRET) throw new ApiError(401, 'Bot avtorizatsiyasi noto\'g\'ri.');

  const { code, telegramId, chatId } = connectSchema.parse(req.body);

  const linkCode = await TelegramLinkCode.findOne({ code: code.toUpperCase() });
  if (!linkCode || linkCode.expiresAt < new Date()) {
    throw new ApiError(400, 'Kod yaroqsiz yoki muddati o\'tgan.');
  }

  await TelegramConnection.findOneAndUpdate(
    { user: linkCode.user },
    { user: linkCode.user, telegramId: String(telegramId), chatId: String(chatId), linkedAt: new Date() },
    { upsert: true }
  );

  const User = require('../models/User');
  await User.findByIdAndUpdate(linkCode.user, { telegramId: String(telegramId) });
  await linkCode.deleteOne();

  const user = await User.findById(linkCode.user);
  res.json({ linked: true, name: user.name });
});

module.exports = { createLinkCode, connect };
