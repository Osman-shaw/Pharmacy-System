const express = require('express');
const router = express.Router();
const SupplierController = require('./supplier.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/', SupplierController.createSupplier);
router.get('/', SupplierController.getSuppliers);
router.get('/:id', SupplierController.getSupplierById);
router.get('/:id/stats', SupplierController.getSupplierStats);
router.put('/:id', SupplierController.updateSupplier);
router.delete('/:id', SupplierController.deleteSupplier);

module.exports = router;
