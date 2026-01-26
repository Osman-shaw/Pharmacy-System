const express = require('express');
const router = express.Router();
const CustomerController = require('./customer.controller');
const { auth } = require('../../middleware/auth.middleware');

router.use(auth);

router.post('/', CustomerController.createCustomer);
router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.put('/:id', CustomerController.updateCustomer);
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
