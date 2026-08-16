const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const TelegramConnection = require('../models/TelegramConnection');
const asyncHandler = require('../utils/asyncHandler');

async function resolveFromJwt(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(payload.sub);
}

// Internal service-to-service auth used ONLY by the PULSE Telegram bot
// process, so it can act on behalf of an already-linked user without a JWT.
// Requires a shared secret (never exposed to any frontend) plus the caller's
// Telegram id, resolved to the SAME PULSE account the Web app uses — see
// "PULSE ACCOUNT — SINGLE SOURCE OF IDENTITY".
async function resolveFromBot(telegramId, secret) {
  if (secret !== process.env.BOT_INTERNAL_SECRET) return null;
  const connection = await TelegramConnection.findOne({ telegramId: String(telegramId) });
  if (!connection) return 'UNLINKED';
  return User.findById(connection.user);
}

// One identity check for the whole platform: Web calls it with a JWT,
// PULSE's Telegram bot calls it with its internal secret + telegram id.
// Either way req.user ends up the same real PULSE account, so every route
// below only has to be written once and both surfaces stay in sync.
const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const botSecret = req.headers['x-bot-secret'];

  let user = null;

  if (authHeader.startsWith('Bearer ')) {
    try {
      user = await resolveFromJwt(authHeader.slice(7));
    } catch {
      throw new ApiError(401, 'Token yaroqsiz yoki muddati o\'tgan.');
    }
  } else if (botSecret) {
    const result = await resolveFromBot(req.headers['x-telegram-id'], botSecret);
    if (result === 'UNLINKED') throw new ApiError(404, 'TAYINLANMAGANSIZ');
    user = result;
  }

  if (!user) throw new ApiError(401, 'Avtorizatsiya talab qilinadi.');

  req.user = user;
  next();
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Bu amal uchun ruxsatingiz yo\'q.'));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
