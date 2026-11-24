const axios = require('axios');

// Backend talks to the Telegram Bot API directly for outbound messages, so
// notifications work even if the bot process is briefly down — the bot
// process only needs to be up to receive inbound commands. Single source of
// truth stays the backend + MongoDB either way.
// `replyMarkup` (optional) attaches inline buttons, e.g. "✅ Ichdim" on a
// medication reminder — handled by the bot's existing callback handlers.
async function sendTelegramMessage(chatId, text, replyMarkup) {
  const token = process.env.BOT_TOKEN;
  if (!token || !chatId) return; // no Telegram linked / not configured — never throw, just skip

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
  } catch (err) {
    console.error('[telegram] sendMessage failed:', err.response?.data || err.message);
  }
}

module.exports = { sendTelegramMessage };
