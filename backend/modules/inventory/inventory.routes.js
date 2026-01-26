const express = require('express');
const router = express.Router();
const InventoryController = require('./inventory.controller');
const { auth } = require('../../middleware/auth.middleware');

// All inventory routes require authentication
router.use(auth);

router.get('/', InventoryController.getInventory);
router.get('/available', InventoryController.getAvailableMedicines);
router.get('/low-stock', InventoryController.getLowStock);
router.get('/notifications', InventoryController.getNotificationData);
router.post('/', InventoryController.addProduct);
router.get('/:id', InventoryController.getProductById);
router.put('/:id', InventoryController.updateProduct);
router.delete('/:id', InventoryController.deleteProduct);

module.exports = router;
