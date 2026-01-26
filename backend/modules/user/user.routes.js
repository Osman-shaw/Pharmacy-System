const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const { auth, authorize } = require('../../middleware/auth.middleware');

// All user routes require authentication and admin privileges
router.use(auth);
router.use(authorize('admin'));

router.get('/', UserController.getAllUsers);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;
