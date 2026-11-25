const router = require('express').Router();
const { register, login, verifyCode, resendCode, google, config, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/config', config);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendCode);
router.post('/google', google);
router.get('/me', requireAuth, me);

module.exports = router;
