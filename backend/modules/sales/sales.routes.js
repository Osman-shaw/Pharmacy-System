const express = require('express');
const router = express.Router();
const SalesController = require('./sales.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/', SalesController.createSale);
router.get('/', SalesController.getSales);
router.get('/:id', SalesController.getSaleById);

module.exports = router;
