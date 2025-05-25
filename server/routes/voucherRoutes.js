// server/routes/voucherRoutes.js
const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint untuk mendapatkan semua voucher (publik)
router.get('/', voucherController.getAllVouchers);

// Endpoint untuk mendapatkan detail voucher berdasarkan ID (publik)
router.get('/:id', voucherController.getVoucherById);

// Endpoint untuk mendapatkan detail voucher berdasarkan kode (publik)
router.get('/code/:code', voucherController.getVoucherByCode);

// Endpoint untuk mendapatkan voucher yang dimiliki oleh user (perlu login)
router.get('/user/my-vouchers', authMiddleware, voucherController.getUserVouchers);

// Endpoint untuk menambahkan voucher ke user (perlu login)
router.post('/user/add', authMiddleware, voucherController.addVoucherToUser);

// Endpoint untuk menggunakan voucher (perlu login)
router.post('/user/use', authMiddleware, voucherController.useVoucher);

module.exports = router;
