const ApiError = require('../utils/ApiError');

// Central error handler — never leaks a stack trace to the client, always a
// clear 4xx/5xx JSON body (Xatolarni oldini olish, CLAUDE.md).
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Malformed ObjectId in a URL/query (e.g. /doctors/abc) — a client error,
  // not a server crash.
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Identifikator noto\'g\'ri formatda.' });
  }
  // Schemas carry Uzbek messages; surface the first one so the user knows
  // exactly what to fix instead of a generic "bad request".
  if (err.name === 'ZodError') {
    const first = err.issues?.[0]?.message;
    return res.status(400).json({ error: first || 'Noto\'g\'ri so\'rov ma\'lumotlari.' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Noto\'g\'ri so\'rov ma\'lumotlari.' });
  }
  // Malformed JSON body.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'So\'rov tanasi noto\'g\'ri JSON.' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Bu ma\'lumot allaqachon mavjud.' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Serverda kutilmagan xatolik yuz berdi.' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Bunday endpoint topilmadi.' });
}

module.exports = { errorHandler, notFoundHandler };
