// Wraps an async route handler so rejected promises are forwarded to Express's
// error handler instead of crashing the process (see Xatolarni oldini olish, CLAUDE.md).
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
