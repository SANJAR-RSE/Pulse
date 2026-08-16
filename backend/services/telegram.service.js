const axios = require('axios');

// Backend talks to the Telegram Bot API directly for outbound messages, so
// notifications work even if the bot process is briefly down — the bot
// process only needs to be up to receive inbound commands. Single source of
// truth stays the backend + MongoDB either way.
async function sendTelegramMessage(chatId, text) {
  const token = process.env.BOT_TOKEN;
  if (!token || !chatId) return; // no Telegram linked / not configured — never throw, just skip

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    });
  } catch (err) {
    console.error('[telegram] sendMessage failed:', err.response?.data || err.message);
  }
}

module.exports = { sendTelegramMessage };
