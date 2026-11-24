const Notification = require('../models/Notification');
const TelegramConnection = require('../models/TelegramConnection');
const { sendTelegramMessage } = require('./telegram.service');
const { emitToUser } = require('../realtime');

// Every user-facing event goes through here: it writes the real Notification
// record (so Web always has it) AND — if the account is Telegram-linked —
// pushes the same message to Telegram. This is the one place that keeps
// "Web'dagi o'zgarish Telegramga ta'sir qiladi" true everywhere in the app.
//
// options.meta     — extra data for live clients (e.g. medicationId so the Web
//                    toast can offer "Ichdim"); not stored, never sensitive.
// options.telegramButtons — inline keyboard rows for the Telegram message.
async function notify(userId, type, title, message, options = {}) {
  const notification = await Notification.create({ user: userId, type, title, message });

  // Web/mobile get it instantly over the socket (Telegram gets it below).
  emitToUser(userId, 'notification:new', {
    _id: String(notification._id),
    type,
    title,
    message,
    createdAt: notification.createdAt,
    ...(options.meta ? { meta: options.meta } : {}),
  });

  const connection = await TelegramConnection.findOne({ user: userId });
  if (connection) {
    const markup = options.telegramButtons ? { inline_keyboard: options.telegramButtons } : undefined;
    await sendTelegramMessage(connection.chatId, `<b>${title}</b>\n${message}`, markup);
  }

  return notification;
}

module.exports = { notify };
