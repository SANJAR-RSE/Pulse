const router = require('express').Router();
const ctrl = require('../controllers/appointment.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.listMyAppointments);
router.post('/', ctrl.createAppointment);
router.patch('/:id/cancel', ctrl.cancelAppointment);

module.exports = router;
