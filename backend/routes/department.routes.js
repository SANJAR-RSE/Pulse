const router = require('express').Router();
const { listDepartments } = require('../controllers/department.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listDepartments);

module.exports = router;
