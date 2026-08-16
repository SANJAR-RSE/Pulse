const router = require('express').Router();
const { createLinkCode, connect } = require('../controllers/telegram.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/link-code', requireAuth, createLinkCode);
router.post('/connect', connect); // bot-authenticated internally via x-bot-secret

module.exports = router;
