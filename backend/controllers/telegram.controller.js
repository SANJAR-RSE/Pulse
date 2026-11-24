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

  const botUsername = process.env.BOT_USERNAME || 'pulsehakaton_bot';
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
  const expected = process.env.BOT_INTERNAL_SECRET;
  // An unset secret must never mean "anyone may call this".
  if (!expected || secret !== expected) throw new ApiError(401, 'Bot avtorizatsiyasi noto\'g\'ri.');

  const { code, telegramId, chatId } = connectSchema.parse(req.body);
  const tgId = String(telegramId);

  const linkCode = await TelegramLinkCode.findOne({ code: code.toUpperCase() });
  if (!linkCode || linkCode.expiresAt < new Date()) {
    throw new ApiError(400, 'Kod yaroqsiz yoki muddati o\'tgan.');
  }

  const User = require('../models/User');

  // One Telegram account belongs to exactly one PULSE account at a time.
  // Linking it to a new account moves it: the previous owner is unlinked
  // (otherwise the unique telegramId index rejects the new link).
  const previous = await TelegramConnection.find({ telegramId: tgId, user: { $ne: linkCode.user } });
  if (previous.length) {
    await TelegramConnection.deleteMany({ _id: { $in: previous.map((c) => c._id) } });
    await User.updateMany({ _id: { $in: previous.map((c) => c.user) } }, { telegramId: null });
  }

  await TelegramConnection.findOneAndUpdate(
    { user: linkCode.user },
    { user: linkCode.user, telegramId: tgId, chatId: String(chatId), linkedAt: new Date() },
    { upsert: true }
  );

  await User.findByIdAndUpdate(linkCode.user, { telegramId: tgId });
  await linkCode.deleteOne();

  const user = await User.findById(linkCode.user);
  res.json({ linked: true, name: user.name });
});

module.exports = { createLinkCode, connect };
