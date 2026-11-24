const router = require('express').Router();
const ctrl = require('../controllers/health.controller');
const { requireAuth } = require('../middleware/auth');
const { emitToUser } = require('../realtime');

router.use(requireAuth);

// Any successful write (water/sleep/workout/medication — from Web OR the
// Telegram bot) tells the same user's open Web sessions to refresh live.
router.use((req, res, next) => {
  if (req.method === 'POST') {
    res.on('finish', () => {
      if (res.statusCode < 300) emitToUser(req.user._id, 'health:changed', { path: req.path });
    });
  }
  next();
});

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
