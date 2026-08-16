const { Markup } = require('telegraf');

// Exact button labels — must match promt.md #18 (Telegram Quick Menu) so
// bot.hears(...) matching stays in sync with what's shown on the keyboard.
const BUTTONS = {
  MY_QUEUE: 'Navbatim',
  BOOK: 'Navbat olish',
  HEALTH: "Bugungi sog'lig'im",
  WATER: 'Suv',
  MEDICATION: 'Dori',
  FIND_DOCTOR: 'Shifokor topish',
  AI: 'PULSE AI',
  PROFILE: 'Profil',
};

function mainMenu() {
  return Markup.keyboard([
    [BUTTONS.MY_QUEUE, BUTTONS.BOOK],
    [BUTTONS.HEALTH, BUTTONS.WATER],
    [BUTTONS.MEDICATION, BUTTONS.FIND_DOCTOR],
    [BUTTONS.AI, BUTTONS.PROFILE],
  ]).resize();
}

module.exports = { BUTTONS, mainMenu };
