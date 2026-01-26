const express = require('express');
const router = express.Router();
const PrescriptionController = require('./prescription.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/', PrescriptionController.createPrescription);
router.get('/', PrescriptionController.getPrescriptions);
router.get('/:id', PrescriptionController.getPrescriptionById);
router.put('/:id', PrescriptionController.updatePrescription);
router.delete('/:id', PrescriptionController.deletePrescription);

module.exports = router;
