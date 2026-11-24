const { Markup } = require('telegraf');
const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');

// "Suv" — quick-add buttons.
async function handleWaterMenu(ctx) {
  await ctx.reply(
    "Qancha suv ichdingiz?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback('+200 ml', 'water:add:200'),
        Markup.button.callback('+300 ml', 'water:add:300'),
        Markup.button.callback('+500 ml', 'water:add:500'),
      ],
    ])
  );
}

function registerWaterActions(bot) {
  bot.action(/^water:add:(\d+)$/, async (ctx) => {
    const amountMl = parseInt(ctx.match[1], 10);
    const telegramId = String(ctx.from.id);
    try {
      await ctx.answerCbQuery(`+${amountMl} ml qo'shilmoqda...`);
    } catch (e) {
      /* ignore stale callback */
    }
    try {
      const { data } = await api.post('/health/water', { amountMl }, forUser(telegramId));
      let consumedMl = data && data.water ? data.water.consumedMl : data && data.consumedMl;
      let goalMl = data && data.water ? data.water.goalMl : data && data.goalMl;

      if (consumedMl == null) {
        // Response shape wasn't what we expected — best-effort refresh from
        // the dashboard so the user still sees an accurate daily total.
        try {
          const dash = await api.get('/health/dashboard', forUser(telegramId));
          consumedMl = dash.data.water ? dash.data.water.consumedMl : undefined;
          goalMl = dash.data.water ? dash.data.water.goalMl : undefined;
        } catch (e) {
          /* best effort only */
        }
      }

      let msg = `✅ +${amountMl} ml suv qo'shildi.`;
      if (consumedMl != null) {
        msg += `\n\nBugungi jami: ${consumedMl} ml${goalMl != null ? ` / ${goalMl} ml` : ''}`;
      }
      await ctx.reply(msg);
    } catch (err) {
      if (isNotLinkedError(err)) {
        await ctx.reply(NOT_LINKED_MESSAGE);
        return;
      }
      console.error('[health/water] xatolik:', err.message);
      await ctx.reply(getErrorMessage(err));
    }
  });
}

module.exports = { handleWaterMenu, registerWaterActions };
