// server/routes/pinRoutes.js
const express = require('express');
const router = express.Router();
const pinController = require('../controllers/pinController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Semua endpoint PIN memerlukan autentikasi
router.use(authMiddleware);

// Endpoint untuk memeriksa apakah user memiliki PIN
router.get('/check', pinController.checkPin);

// Endpoint untuk membuat PIN baru
router.post('/create', pinController.createPin);

// Endpoint untuk memverifikasi PIN
router.post('/verify', pinController.verifyPin);

// Endpoint untuk mengubah PIN
router.put('/update', pinController.updatePin);

module.exports = router;
