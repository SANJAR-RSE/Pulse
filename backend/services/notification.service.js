const Notification = require('../models/Notification');
const TelegramConnection = require('../models/TelegramConnection');
const { sendTelegramMessage } = require('./telegram.service');
const { emitToUser } = require('../realtime');

// Every user-facing event goes through here: it writes the real Notification
// record (so Web always has it) AND — if the account is Telegram-linked —
// pushes the same message to Telegram. This is the one place that keeps
// "Web'dagi o'zgarish Telegramga ta'sir qiladi" true everywhere in the app.
async function notify(userId, type, title, message) {
  const notification = await Notification.create({ user: userId, type, title, message });

  // Web gets it instantly over the socket (Telegram gets it below).
  emitToUser(userId, 'notification:new', {
    _id: String(notification._id),
    type,
    title,
    message,
    createdAt: notification.createdAt,
  });

  const connection = await TelegramConnection.findOne({ user: userId });
  if (connection) {
    await sendTelegramMessage(connection.chatId, `<b>${title}</b>\n${message}`);
  }

  return notification;
}

module.exports = { notify };
