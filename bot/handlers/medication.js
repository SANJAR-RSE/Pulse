const { Markup } = require('telegraf');
const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');

// "Dori" — list today's medications, each with a "Ichdim" button when not
// yet taken today.
async function handleMedicationList(ctx) {
  const telegramId = String(ctx.from.id);
  try {
    const { data } = await api.get('/health/medications', forUser(telegramId));
    const medications = data.medications || [];
    if (!medications.length) {
      await ctx.reply(
        "Hozircha dori jadvalingiz yo'q. Uni Web'dagi PULSE profilingizdan qo'shishingiz mumkin."
      );
      return;
    }
    for (const med of medications) {
      const id = med._id || med.id;
      const text = `💊 ${med.name} — ${med.time}${med.takenToday ? '\n✅ Bugun ichilgan' : ''}`;
      if (med.takenToday) {
        await ctx.reply(text);
      } else {
        await ctx.reply(text, Markup.inlineKeyboard([[Markup.button.callback('✅ Ichdim', `med:taken:${id}`)]]));
      }
    }
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[health/medications] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
  }
}

function registerMedicationActions(bot) {
  bot.action(/^med:taken:(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    const telegramId = String(ctx.from.id);
    try {
      await ctx.answerCbQuery();
    } catch (e) {
      /* ignore stale callback */
    }
    try {
      await api.post(`/health/medications/${id}/taken`, {}, forUser(telegramId));
      try {
        await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
      } catch (e) {
        /* message may already be edited/old — not critical */
      }
      await ctx.reply('✅ Belgilandi: dori ichildi.');
    } catch (err) {
      if (isNotLinkedError(err)) {
        await ctx.reply(NOT_LINKED_MESSAGE);
        return;
      }
      console.error('[medications/taken] xatolik:', err.message);
      await ctx.reply(getErrorMessage(err));
    }
  });
}

module.exports = { handleMedicationList, registerMedicationActions };
