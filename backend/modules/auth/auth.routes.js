const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validation.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Auth endpoints
router.post('/register', [
    authLimiter,
    body('username').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('role').optional().isIn(['admin', 'pharmacist', 'store-manager', 'cashier']).withMessage('Invalid role'),
    validate
], AuthController.register);

router.post('/login', [
    authLimiter,
    body('username').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], AuthController.login);

// Get current user profile (requires JWT auth middleware)
const { auth } = require('../../middleware/auth.middleware');
router.get('/profile', auth, AuthController.profile);

// Logout (stateless, just for API completeness)
router.post('/logout', AuthController.logout);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
