const express = require('express');
const router = express.Router();
const NotificationController = require('./notification.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.get('/', NotificationController.getNotifications);
router.put('/:id/read', NotificationController.markRead);

module.exports = router;
