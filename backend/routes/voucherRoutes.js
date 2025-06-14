// server/routes/voucherRoutes.js
const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Admin routes for voucher management (placed first to avoid conflicts)
router.get('/admin/all', adminMiddleware, voucherController.getAllVouchersAdmin);
router.get('/admin/stats', adminMiddleware, voucherController.getVoucherStats);
router.get('/admin/:id/users', adminMiddleware, voucherController.getVoucherUsers);
router.get('/admin/:id', adminMiddleware, voucherController.getVoucherById);
router.post('/admin', adminMiddleware, voucherController.createVoucher);
router.put('/admin/:id', adminMiddleware, voucherController.updateVoucher);
router.delete('/admin/:id', adminMiddleware, voucherController.deleteVoucher);

// User routes for voucher management
router.get('/user/my-vouchers', authMiddleware, voucherController.getUserVouchers);
router.post('/user/add', authMiddleware, voucherController.addVoucherToUser);
router.post('/user/use', authMiddleware, voucherController.useVoucher);

// Endpoint untuk mendapatkan detail voucher berdasarkan kode (publik)
router.get('/code/:code', voucherController.getVoucherByCode);

// Endpoint untuk mendapatkan semua voucher (publik)
router.get('/', voucherController.getAllVouchers);

// Endpoint untuk mendapatkan detail voucher berdasarkan ID (publik)
// This must be last as it's the most generic route with a parameter
router.get('/:id', voucherController.getVoucherById);

module.exports = router;
