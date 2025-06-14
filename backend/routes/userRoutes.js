// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// User profile routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/account', authMiddleware, userController.deleteAccount);

// Admin routes for user management
router.get('/admin/count', adminMiddleware, userController.getUsersCount);
router.get('/admin/stats', adminMiddleware, userController.getUserStats);
router.get('/admin/all', adminMiddleware, userController.getAllUsers);
router.get('/admin/:userId', adminMiddleware, userController.getUserById);
// Tambah user baru oleh admin
router.post('/admin', adminMiddleware, userController.createUserByAdmin);
// Edit user oleh admin
router.put('/admin/:userId', adminMiddleware, userController.updateUserByAdmin);
// Hapus user oleh admin
router.delete('/admin/:userId', adminMiddleware, userController.deleteUserByAdmin);

module.exports = router;
