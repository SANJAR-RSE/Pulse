// Minimal in-memory per-user UI state. The bot has no database of its own —
// this only tracks "what is this chat currently doing" (e.g. talking to
// PULSE AI), never PULSE data itself (that always comes from the backend).

// telegramId (string) -> boolean, true while the user's next plain-text
// message should be forwarded to PULSE AI instead of treated as a menu miss.
const aiMode = new Map();

module.exports = { aiMode };
