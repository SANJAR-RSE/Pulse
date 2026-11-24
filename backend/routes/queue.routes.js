const router = require('express').Router();
const { getMyQueue } = require('../controllers/queue.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/:appointmentId', requireAuth, getMyQueue);

module.exports = router;
