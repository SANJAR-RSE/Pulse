const Notification = require('../models/Notification');
const TelegramConnection = require('../models/TelegramConnection');
const { sendTelegramMessage } = require('./telegram.service');

// Every user-facing event goes through here: it writes the real Notification
// record (so Web always has it) AND — if the account is Telegram-linked —
// pushes the same message to Telegram. This is the one place that keeps
// "Web'dagi o'zgarish Telegramga ta'sir qiladi" true everywhere in the app.
async function notify(userId, type, title, message) {
  const notification = await Notification.create({ user: userId, type, title, message });

  const connection = await TelegramConnection.findOne({ user: userId });
  if (connection) {
    await sendTelegramMessage(connection.chatId, `<b>${title}</b>\n${message}`);
  }

  return notification;
}

module.exports = { notify };
