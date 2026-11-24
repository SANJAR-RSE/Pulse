const { api, forUser, botOnlyHeaders, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');
const { mainMenu } = require('../keyboards');

// /start [code]
// - with a code: links this Telegram account to the PULSE web account.
// - without a code: shows the main menu if already linked, otherwise
//   explains how to link.
async function handleStart(ctx) {
  const code = ctx.startPayload && ctx.startPayload.trim();
  const telegramId = String(ctx.from.id);
  const chatId = String(ctx.chat.id);

  if (code) {
    try {
      const { data } = await api.post(
        '/telegram/connect',
        { code, telegramId, chatId },
        botOnlyHeaders()
      );
      const name = data && data.name ? data.name : '';
      await ctx.reply(`✅ Muvaffaqiyatli ulandingiz${name ? `, ${name}` : ''}!`, mainMenu());
    } catch (err) {
      console.error('[telegram/connect] xatolik:', err.message);
      await ctx.reply(getErrorMessage(err));
    }
    return;
  }

  try {
    const { data } = await api.get('/auth/me', forUser(telegramId));
    const user = data.user;
    await ctx.reply(`Salom, ${user.name}! PULSE botiga xush kelibsiz.`, mainMenu());
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[auth/me] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
  }
}

module.exports = { handleStart };
