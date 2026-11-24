const router = require('express').Router();
const { listClinics, getClinic } = require('../controllers/clinic.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', listClinics);
router.get('/:id', getClinic);

module.exports = router;
