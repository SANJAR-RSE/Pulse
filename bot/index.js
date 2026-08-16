require('dotenv').config();
const http = require('http');
const { Telegraf } = require('telegraf');

// Render's free tier only offers "web service" (expects an open port), not a
// worker — this tiny server exists purely to satisfy that health check. The
// actual bot runs on long-polling in the same process, same as any worker.
const PORT = process.env.PORT || 3002;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PULSE Telegram bot is running.');
  })
  .listen(PORT, () => console.log(`[health] listening on port ${PORT}`));

// Render's free tier spins a web service down after ~15 min with no INBOUND
// HTTP traffic — but this bot only makes OUTBOUND long-polling calls to
// Telegram, so without this it goes to sleep between messages and stops
// polling entirely. A real external HTTP round-trip to our own public URL
// every 10 minutes keeps it counted as "active" and the bot always-on.
const SELF_URL = process.env.RENDER_EXTERNAL_URL;
if (SELF_URL) {
  setInterval(() => {
    fetch(SELF_URL).catch(() => {
      /* best-effort keepalive — a failed ping isn't worth crashing over */
    });
  }, 10 * 60 * 1000);
  console.log(`[keepalive] self-pinging ${SELF_URL} every 10 min`);
}

const { mainMenu, BUTTONS } = require('./keyboards');
const { handleStart } = require('./handlers/start');
const { handleMyQueue } = require('./handlers/queue');
const { handleBookingStart, registerBookingActions } = require('./handlers/booking');
const { handleHealthDashboard } = require('./handlers/health');
const { handleWaterMenu, registerWaterActions } = require('./handlers/water');
const { handleMedicationList, registerMedicationActions } = require('./handlers/medication');
const { handleAIStart, handleAIMessage } = require('./handlers/ai');
const { handleProfile } = require('./handlers/profile');
const { aiMode } = require('./state');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN topilmadi. .env faylida BOT_TOKEN ni sozlang (.env.example'ga qarang).");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Wraps a handler so any unexpected error never crashes the bot — the user
// always gets a friendly Uzbek message instead of the bot going silent.
function guarded(handler) {
  return async (ctx) => {
    try {
      await handler(ctx);
    } catch (err) {
      console.error('[handler] kutilmagan xatolik:', err);
      try {
        await ctx.reply("Kechirasiz, xatolik yuz berdi. Birozdan keyin qayta urinib ko'ring.");
      } catch (e) {
        /* ignore — can't even reply */
      }
    }
  };
}

bot.start(guarded(handleStart));

bot.hears(BUTTONS.MY_QUEUE, guarded(handleMyQueue));
bot.hears(BUTTONS.BOOK, guarded(handleBookingStart));
bot.hears(BUTTONS.FIND_DOCTOR, guarded(handleBookingStart));
bot.hears(BUTTONS.HEALTH, guarded(handleHealthDashboard));
bot.hears(BUTTONS.WATER, guarded(handleWaterMenu));
bot.hears(BUTTONS.MEDICATION, guarded(handleMedicationList));
bot.hears(BUTTONS.PROFILE, guarded(handleProfile));
bot.hears(
  BUTTONS.AI,
  guarded(async (ctx) => {
    await handleAIStart(ctx);
  })
);

registerBookingActions(bot);
registerWaterActions(bot);
registerMedicationActions(bot);

const MENU_TEXTS = new Set(Object.values(BUTTONS));

// Any plain-text message that isn't a menu button: forward to PULSE AI if
// the chat is currently in AI mode, otherwise nudge the user back to the menu.
bot.on(
  'text',
  guarded(async (ctx) => {
    const text = ctx.message.text || '';
    if (text.startsWith('/')) return; // commands are handled elsewhere
    if (MENU_TEXTS.has(text)) return; // already handled by bot.hears above

    const telegramId = String(ctx.from.id);
    if (aiMode.get(telegramId)) {
      await handleAIMessage(ctx);
      return;
    }

    await ctx.reply('Quyidagi tugmalardan birini tanlang yoki "PULSE AI" orqali savol bering.', mainMenu());
  })
);

bot.catch((err, ctx) => {
  console.error(`[telegraf] yangilanishni qayta ishlashda xatolik (${ctx.updateType}):`, err);
});

bot
  .launch()
  .then(() => console.log('PULSE Telegram bot ishga tushdi.'))
  .catch((err) => {
    console.error('Botni ishga tushirishda xatolik:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
