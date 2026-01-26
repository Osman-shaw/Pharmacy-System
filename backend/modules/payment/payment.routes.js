const express = require('express');
const router = express.Router();
const PaymentController = require('./payment.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/process', PaymentController.processPayment);
router.get('/verify/:transactionId', PaymentController.verifyPaymentHook);

module.exports = router;
