const router = require('express').Router();
const { listMyRecords } = require('../controllers/medicalRecord.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listMyRecords);

module.exports = router;
