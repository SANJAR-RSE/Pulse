const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');

const STATUS_LABELS = {
  WAITING: 'Kutilmoqda',
  NEAR: 'Navbatingiz yaqinlashmoqda',
  CALLED: 'Chaqirildingiz',
  COMPLETED: 'Yakunlandi',
  CANCELLED: 'Bekor qilindi',
};

// "Navbatim" — finds the user's nearest upcoming appointment and shows its
// live queue status.
async function handleMyQueue(ctx) {
  const telegramId = String(ctx.from.id);

  let appointments;
  try {
    const { data } = await api.get('/appointments', forUser(telegramId));
    appointments = data.appointments || [];
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[appointments] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
    return;
  }

  const active = appointments
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];

  if (!active) {
    await ctx.reply(
      "Sizda hozircha faol navbat yo'q.\n\nYangi navbat olish uchun \"Navbat olish\" tugmasini bosing."
    );
    return;
  }

  try {
    const appointmentId = active._id || active.id;
    const { data: q } = await api.get(`/queue/${appointmentId}`, forUser(telegramId));
    const lines = [
      `🎫 Sizning navbatingiz: ${q.code}`,
      `Holat: ${STATUS_LABELS[q.status] || q.status}`,
      `Oldingizda: ${q.aheadCount} kishi`,
      `Taxminiy kutish: ${q.estimatedWaitMinutes} daqiqa`,
    ];
    await ctx.reply(lines.join('\n'));
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[queue] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
  }
}

module.exports = { handleMyQueue };
