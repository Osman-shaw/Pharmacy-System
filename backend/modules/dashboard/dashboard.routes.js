const express = require('express');
const router = express.Router();
const DashboardController = require('./dashboard.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.get('/stats', DashboardController.getStats);

module.exports = router;
