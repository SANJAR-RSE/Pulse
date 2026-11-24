const router = require('express').Router();
const { listDoctors, getDoctor, getDoctorSlots } = require('../controllers/doctor.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.get('/:id/slots', getDoctorSlots);

module.exports = router;
