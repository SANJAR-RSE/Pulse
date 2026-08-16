const router = require('express').Router();
const ctrl = require('../controllers/doctorPanel.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('doctor'));

router.get('/queue', ctrl.getTodayQueue);
router.post('/queue/next', ctrl.callNextPatient);
router.post('/appointments/:id/complete', ctrl.completeAppointment);

module.exports = router;
