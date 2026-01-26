const express = require('express');
const router = express.Router();
const MedicineController = require('./medicine.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.get('/', MedicineController.getMedicines);
router.post('/', MedicineController.createMedicine);
router.get('/:id', MedicineController.getMedicineById);
router.put('/:id', MedicineController.updateMedicine);
router.delete('/:id', MedicineController.deleteMedicine);

module.exports = router;
