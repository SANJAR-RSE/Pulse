const { Markup } = require('telegraf');
const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');

// Shared step-by-step inline-keyboard booking flow, used both by
// "Navbat olish" and "Shifokor topish" (same flow, single implementation).
//
// department -> doctor -> today's slot -> POST /appointments

function todayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function doctorFullName(doc) {
  const fromParts = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
  return fromParts || doc.name || 'Shifokor';
}

async function handleBookingStart(ctx) {
  const telegramId = String(ctx.from.id);
  try {
    const { data } = await api.get('/departments', forUser(telegramId));
    const departments = data.departments || [];
    if (!departments.length) {
      await ctx.reply("Hozircha bo'limlar mavjud emas. Birozdan so'ng qayta urinib ko'ring.");
      return;
    }
    const buttons = departments.map((d) => [
      Markup.button.callback(d.name, `book:dept:${d._id || d.id}`),
    ]);
    await ctx.reply("Qaysi bo'lim bo'yicha navbat olmoqchisiz?", Markup.inlineKeyboard(buttons));
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[departments] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
  }
}

function registerBookingActions(bot) {
  bot.action(/^book:dept:(.+)$/, async (ctx) => {
    const departmentId = ctx.match[1];
    const telegramId = String(ctx.from.id);
    try {
      await ctx.answerCbQuery();
    } catch (e) {
      /* ignore stale callback */
    }
    try {
      const { data } = await api.get('/doctors', {
        ...forUser(telegramId),
        params: { department: departmentId },
      });
      const doctors = data.doctors || [];
      if (!doctors.length) {
        await ctx.reply("Bu bo'limda hozircha shifokorlar mavjud emas. Boshqa bo'limni tanlang.");
        return;
      }
      let text = "Shifokorni tanlang:\n\n";
      doctors.forEach((doc, i) => {
        text += `${i + 1}. ${doctorFullName(doc)} — tajriba: ${doc.experience != null ? doc.experience + ' yil' : '—'}, reyting: ${doc.rating != null ? doc.rating : '—'}\n`;
      });
      const buttons = doctors.map((doc) => [
        Markup.button.callback(doctorFullName(doc), `book:doctor:${doc._id || doc.id}`),
      ]);
      await ctx.reply(text, Markup.inlineKeyboard(buttons));
    } catch (err) {
      if (isNotLinkedError(err)) {
        await ctx.reply(NOT_LINKED_MESSAGE);
        return;
      }
      console.error('[doctors] xatolik:', err.message);
      await ctx.reply(getErrorMessage(err));
    }
  });

  bot.action(/^book:doctor:(.+)$/, async (ctx) => {
    const doctorId = ctx.match[1];
    const telegramId = String(ctx.from.id);
    try {
      await ctx.answerCbQuery();
    } catch (e) {
      /* ignore stale callback */
    }
    const date = todayDate();
    try {
      const { data } = await api.get(`/doctors/${doctorId}/slots`, {
        ...forUser(telegramId),
        params: { date },
      });
      const slots = data.slots || [];
      if (!slots.length) {
        await ctx.reply(
          "Bugun bu shifokorda bo'sh vaqt qolmagan. Iltimos, boshqa shifokorni tanlang yoki ertaga qayta urinib ko'ring."
        );
        return;
      }
      const buttons = [];
      for (let i = 0; i < slots.length; i += 3) {
        buttons.push(
          slots.slice(i, i + 3).map((t) => Markup.button.callback(t, `book:slot:${doctorId}:${t}`))
        );
      }
      await ctx.reply(`Bugungi bo'sh vaqtlar (${date}):`, Markup.inlineKeyboard(buttons));
    } catch (err) {
      if (isNotLinkedError(err)) {
        await ctx.reply(NOT_LINKED_MESSAGE);
        return;
      }
      console.error('[doctor slots] xatolik:', err.message);
      await ctx.reply(getErrorMessage(err));
    }
  });

  bot.action(/^book:slot:([^:]+):(.+)$/, async (ctx) => {
    const doctorId = ctx.match[1];
    const time = ctx.match[2];
    const telegramId = String(ctx.from.id);
    try {
      await ctx.answerCbQuery();
    } catch (e) {
      /* ignore stale callback */
    }
    const date = todayDate();
    try {
      const { data } = await api.post('/appointments', { doctorId, date, time }, forUser(telegramId));
      const code =
        (data.queue && data.queue.code) || (data.appointment && data.appointment.code) || '—';
      await ctx.reply(
        `✅ Navbat muvaffaqiyatli olindi!\n\nSana: ${date}\nVaqt: ${time}\nNavbat kodi: ${code}\n\nHolatni "Navbatim" tugmasi orqali kuzatib borishingiz mumkin.`
      );
    } catch (err) {
      if (isNotLinkedError(err)) {
        await ctx.reply(NOT_LINKED_MESSAGE);
        return;
      }
      console.error('[appointments create] xatolik:', err.message);
      await ctx.reply(getErrorMessage(err));
    }
  });
}

module.exports = { handleBookingStart, registerBookingActions };
