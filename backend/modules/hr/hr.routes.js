const express = require('express');
const { body } = require('express-validator');
const controller = require('./hr.controller');
const { auth, authorize } = require('../../middleware/auth.middleware');
// Note: assuming auth middleware path is consistent with other modules

const router = express.Router();

router.use(auth);

// --- EMPLOYEE ROUTES ---
router.get('/employees', controller.getEmployees);
router.get('/employees/:id', controller.getEmployeeById);
router.post('/employees', authorize('admin'), [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('salary').isFloat({ min: 0 }).withMessage('Salary must be non-negative')
], controller.createEmployee);
router.put('/employees/:id', authorize('admin'), controller.updateEmployee);
router.delete('/employees/:id', authorize('admin'), controller.deleteEmployee);


// --- DESIGNATION ROUTES ---
router.get('/designations', controller.getDesignations);
router.get('/designations/:id', controller.getDesignationById);
router.post('/designations', authorize('admin'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('department').trim().notEmpty().withMessage('Department is required')
], controller.createDesignation);
router.put('/designations/:id', authorize('admin'), controller.updateDesignation);
router.delete('/designations/:id', authorize('admin'), controller.deleteDesignation);


// --- ATTENDANCE ROUTES ---
router.get('/attendance', controller.getAttendance);
router.post('/attendance/check-in', [
    body('employee').optional(),
    body('date').optional().isISO8601().withMessage('Valid date is required')
], controller.checkIn);
router.post('/attendance/check-out', [
    body('employee').optional(),
    body('date').optional().isISO8601().withMessage('Valid date is required')
], controller.checkOut);

// --- PAYROLL ROUTES ---
router.get('/payroll', controller.getPayrolls);
router.post('/payroll', authorize('admin'), [
    body('employee').notEmpty().withMessage('Employee is required'),
    body('payPeriod.startDate').isISO8601().withMessage('Valid start date is required'),
    body('payPeriod.endDate').isISO8601().withMessage('Valid end date is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one payroll item is required'),
    body('paymentDate').isISO8601().withMessage('Valid payment date is required')
], controller.createPayroll);

module.exports = router;
