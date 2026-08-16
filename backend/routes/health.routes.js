const router = require('express').Router();
const ctrl = require('../controllers/health.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/dashboard', ctrl.getDashboard);
router.get('/statistics', ctrl.getStatistics);

router.get('/water', ctrl.listWater);
router.post('/water', ctrl.addWater);

router.get('/sleep', ctrl.listSleep);
router.post('/sleep', ctrl.addSleep);

router.get('/workouts', ctrl.listWorkouts);
router.post('/workouts', ctrl.addWorkout);

router.get('/medications', ctrl.listMedications);
router.post('/medications', ctrl.addMedication);
router.post('/medications/:id/taken', ctrl.logMedicationTaken);

module.exports = router;
