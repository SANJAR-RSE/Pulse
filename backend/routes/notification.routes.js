const router = require('express').Router();
const { listNotifications, markRead } = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', listNotifications);
router.patch('/:id/read', markRead);

module.exports = router;
