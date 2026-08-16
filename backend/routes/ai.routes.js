const router = require('express').Router();
const { chat, history } = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/history', history);
router.post('/chat', chat);

module.exports = router;
