const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');
const { aiMode } = require('../state');

// "PULSE AI" — puts the chat into AI mode; the next plain-text message is
// forwarded to POST /ai/chat instead of being treated as an unknown command.
async function handleAIStart(ctx) {
  const telegramId = String(ctx.from.id);
  aiMode.set(telegramId, true);
  await ctx.reply(
    '🤖 PULSE AI bilan suhbat boshlandi. Savolingizni yozing (masalan: "Menga bugun LOR kerak" yoki "Navbatim qachon?").\n\n' +
      'Chiqish uchun pastdagi menyudan istalgan tugmani bosing.'
  );
}

async function handleAIMessage(ctx) {
  const telegramId = String(ctx.from.id);
  const message = ctx.message.text;
  try {
    const { data } = await api.post('/ai/chat', { message }, forUser(telegramId));
    await ctx.reply(data.reply || "PULSE AI javob bera olmadi.");
    if (data.action && data.action.type) {
      await handleAction(ctx, data.action);
    }
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      aiMode.delete(telegramId);
      return;
    }
    console.error('[ai/chat] xatolik:', err.message);
    await ctx.reply("PULSE AI bilan aloqa o'rnatilmadi. " + getErrorMessage(err));
  }
}

// Maps a subset of AI actions to existing bot flows (no duplicate logic).
async function handleAction(ctx, action) {
  try {
    switch (action.type) {
      case 'view_queue': {
        const { handleMyQueue } = require('./queue');
        await handleMyQueue(ctx);
        break;
      }
      case 'view_doctors':
      case 'find_doctor':
      case 'book_appointment': {
        const { handleBookingStart } = require('./booking');
        await handleBookingStart(ctx);
        break;
      }
      case 'view_medical_history': {
        await ctx.reply(
          "Tibbiy tarixingizni Web'dagi PULSE ilovasida \"Medical History\" bo'limidan ko'rishingiz mumkin."
        );
        break;
      }
      default:
        // add_water / add_sleep / add_workout va boshqalar — hozircha faqat
        // AI javobi bilan cheklanadi, alohida taklif ko'rsatilmaydi.
        break;
    }
  } catch (e) {
    console.error('[ai action] xatolik:', e.message);
  }
}

module.exports = { handleAIStart, handleAIMessage };
