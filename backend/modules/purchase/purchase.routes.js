const express = require('express');
const router = express.Router();
const PurchaseController = require('./purchase.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/', PurchaseController.createPurchase);
router.get('/', PurchaseController.getPurchases);
router.get('/:id', PurchaseController.getPurchaseById);
router.put('/:id', PurchaseController.updatePurchase);
router.delete('/:id', PurchaseController.deletePurchase);
router.post('/:id/receive', PurchaseController.receivePurchase);

module.exports = router;
