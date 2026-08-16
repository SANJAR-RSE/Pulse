const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');

// "Bugungi sog'lig'im" — GET /health/dashboard formatted nicely.
async function handleHealthDashboard(ctx) {
  const telegramId = String(ctx.from.id);
  try {
    const { data } = await api.get('/health/dashboard', forUser(telegramId));
    const water = data.water || {};
    const sleep = data.sleep;
    const workout = data.workout || {};
    const medication = data.medication || {};

    const lines = ["📊 Bugungi sog'lig'ingiz:", ''];
    lines.push(`💧 Suv: ${water.consumedMl != null ? water.consumedMl : 0} ml / ${water.goalMl != null ? water.goalMl : 0} ml`);
    if (sleep && sleep.durationMinutes != null) {
      const h = Math.floor(sleep.durationMinutes / 60);
      const m = sleep.durationMinutes % 60;
      lines.push(`😴 Uyqu: ${h} soat ${m} daqiqa`);
    } else {
      lines.push("😴 Uyqu: bugun qayd etilmagan");
    }
    lines.push(`🏃 Mashg'ulot: ${workout.totalMinutes != null ? workout.totalMinutes : 0} daqiqa`);
    lines.push(`💊 Dori: ${medication.taken != null ? medication.taken : 0} / ${medication.total != null ? medication.total : 0}`);
    lines.push(`❤️ Health Score: ${data.healthScore != null ? data.healthScore : '—'}%`);

    if (data.nextAppointment) {
      const na = data.nextAppointment;
      lines.push('');
      lines.push(`📅 Keyingi qabul: ${na.date || ''} ${na.time || ''}`.trim());
    }
    if (data.queue) {
      lines.push(`🎫 Navbat: ${data.queue.code} — oldingizda ${data.queue.aheadCount} kishi (~${data.queue.estimatedWaitMinutes} daqiqa)`);
    }

    await ctx.reply(lines.join('\n'));
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[health/dashboard] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
  }
}

module.exports = { handleHealthDashboard };
