const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

router.get('/overview', ctrl.overview);
router.get('/users', ctrl.listUsers);
router.get('/appointments', ctrl.recentAppointments);

module.exports = router;
