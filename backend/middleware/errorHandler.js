const ApiError = require('../utils/ApiError');

// Central error handler — never leaks a stack trace to the client, always a
// clear 4xx/5xx JSON body (Xatolarni oldini olish, CLAUDE.md).
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({ error: 'Noto\'g\'ri so\'rov ma\'lumotlari.' });
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
