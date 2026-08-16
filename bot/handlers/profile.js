const { api, forUser, isNotLinkedError, getErrorMessage, NOT_LINKED_MESSAGE } = require('../services/api');

const ROLE_LABELS = {
  patient: 'Bemor',
  doctor: 'Shifokor',
  admin: 'Administrator',
};

// "Profil" — GET /auth/me
async function handleProfile(ctx) {
  const telegramId = String(ctx.from.id);
  try {
    const { data } = await api.get('/auth/me', forUser(telegramId));
    const user = data.user;
    const lines = [
      '👤 Profil',
      '',
      `Ism: ${user.name}`,
      `Email: ${user.email}`,
      `Rol: ${ROLE_LABELS[user.role] || user.role}`,
    ];
    await ctx.reply(lines.join('\n'));
  } catch (err) {
    if (isNotLinkedError(err)) {
      await ctx.reply(NOT_LINKED_MESSAGE);
      return;
    }
    console.error('[auth/me] xatolik:', err.message);
    await ctx.reply(getErrorMessage(err));
  }
}

module.exports = { handleProfile };
