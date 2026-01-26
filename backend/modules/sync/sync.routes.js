const express = require('express');
const router = express.Router();
const SyncController = require('./sync.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.get('/pull', SyncController.pull);
router.post('/push', SyncController.push);

module.exports = router;
