const express = require('express');
const router = express.Router();
const controller = require('./audit.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.get('/', controller.getLogs);

module.exports = router;
