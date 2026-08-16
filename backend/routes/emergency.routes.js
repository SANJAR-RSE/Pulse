const router = require('express').Router();
const { listEmergencyContacts } = require('../controllers/emergency.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listEmergencyContacts);

module.exports = router;
